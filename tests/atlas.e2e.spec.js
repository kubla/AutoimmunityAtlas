import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const clusters = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'clusters.json'), 'utf8'));
const disorders = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'disorders.json'), 'utf8'));
const glossary = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'glossary.json'), 'utf8'));
const linksRegistryRaw = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data', 'links.json'), 'utf8'));
const linksRegistry = linksRegistryRaw.gene_to_snpedia ?? linksRegistryRaw;

const firstCluster = [...clusters].sort((a, b) => a.order - b.order)[0];
const expectedFirstClusterCount = disorders.filter((d) => d.primaryCluster === firstCluster.id).length;
const allGenes = [...new Set(disorders.flatMap((d) => d.genes))].sort();

test.describe('Atlas shell and initialization', () => {
  test('renders the core 3-region layout and map svg', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByRole('heading', { level: 1, name: /monogenic autoimmunity atlas/i })).toBeVisible();
    await expect(page.locator('#controls')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('#inspector')).toBeVisible();
    await expect(page.locator('svg#atlas-svg')).toBeVisible();
  });

  test('does not fail initialization and shows interactive controls', async ({ page }) => {
    await page.goto('./');

    await expect(page.locator('#inspector .warning')).toHaveCount(0);
    await expect(page.locator('#controls [data-cluster]')).toHaveCount(clusters.length);
    await expect(page.locator('#controls #gene-filter')).toBeVisible();
    await expect(page.locator('#controls #clear-filters')).toBeVisible();
  });

  test('starts filtered to the first cluster and displays only its node count', async ({ page }) => {
    await page.goto('./');

    const activeClusterButton = page.locator('#controls [data-cluster].active');
    await expect(activeClusterButton).toHaveCount(1);
    await expect(activeClusterButton).toHaveAttribute('data-cluster', firstCluster.id);
    await expect(page.locator('svg .nodes circle')).toHaveCount(expectedFirstClusterCount);
  });
});

test.describe('Filtering behavior', () => {
  test('cluster toggle can isolate a different cluster', async ({ page }) => {
    const secondCluster = [...clusters].sort((a, b) => a.order - b.order)[1];
    const expectedCount = disorders.filter((d) => d.primaryCluster === secondCluster.id).length;

    await page.goto('./');
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.locator(`#controls [data-cluster="${secondCluster.id}"]`).click();

    await expect(page.locator(`#controls [data-cluster="${secondCluster.id}"].active`)).toHaveCount(1);
    await expect(page.locator('svg .nodes circle')).toHaveCount(expectedCount);
  });

  test('gene filter options are complete and filter visible nodes', async ({ page }) => {
    const targetGene = allGenes[0];
    const expectedCount = disorders.filter((d) => d.genes.includes(targetGene)).length;

    await page.goto('./');

    const options = page.locator('#gene-filter option');
    await expect(options).toHaveCount(allGenes.length + 1);
    await expect(options.nth(0)).toHaveAttribute('value', '');

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.selectOption('#gene-filter', targetGene);
    await expect(page.locator('svg .nodes circle')).toHaveCount(expectedCount);
  });

  test('clear filters resets cluster, tag, and gene filtering', async ({ page }) => {
    const tagButton = page.locator('#controls [data-tag]').first();

    await page.goto('./');
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await tagButton.click();
    await page.selectOption('#gene-filter', allGenes[1]);

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page.locator('#controls [data-cluster].active')).toHaveCount(0);
    await expect(page.locator('#controls [data-tag].active')).toHaveCount(0);
    await expect(page.locator('#gene-filter')).toHaveValue('');
    await expect(page.locator('svg .nodes circle')).toHaveCount(disorders.length);
  });
});

test.describe('Inspector integrity', () => {
  test('clicking a node opens a complete inspector in the expected section order', async ({ page }) => {
    await page.goto('./');

    const firstNode = page.locator('svg .nodes circle').first();
    await firstNode.click();

    await expect(page.locator('#inspector h2')).toBeVisible();

    const expectedOrder = [
      'Aliases',
      'Clusters',
      'Genes',
      'Inheritance',
      'Mechanism chain',
      'Hallmarks',
      'Related by pathway',
      'Related by phenotype',
      'References'
    ];

    const headings = page.locator('#inspector .section h3');
    await expect(headings).toHaveCount(expectedOrder.length);

    for (const [index, title] of expectedOrder.entries()) {
      await expect(headings.nth(index)).toHaveText(title);
    }

    const mechanismCount = await page.locator('#inspector .section h3:has-text("Mechanism chain") + ol li').count();
    const hallmarkCount = await page.locator('#inspector .section h3:has-text("Hallmarks") + ul li').count();
    expect(mechanismCount).toBeGreaterThan(2);
    expect(hallmarkCount).toBeGreaterThan(2);
  });

  test('gene chips in inspector resolve only through link registry', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await page.locator('svg .nodes circle').first().click();

    const geneLinks = page.locator('#inspector .section h3:has-text("Genes") ~ a.chip');
    const count = await geneLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const symbol = await geneLinks.nth(i).innerText();
      const href = await geneLinks.nth(i).getAttribute('href');
      expect(linksRegistry[symbol]).toBeTruthy();
      expect(href).toBe(linksRegistry[symbol]);
    }
  });

  test('linkified mechanism or hallmark terms come from glossary allowlist', async ({ page }) => {
    const glossaryUrls = new Set(glossary.map((entry) => entry.url));

    await page.goto('./');
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.locator('svg .nodes circle').first().click();

    const contextualLinks = page.locator(
      '#inspector .section h3:has-text("Mechanism chain") + ol a, #inspector .section h3:has-text("Hallmarks") + ul a'
    );

    const linkCount = await contextualLinks.count();
    for (let i = 0; i < linkCount; i += 1) {
      const href = await contextualLinks.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(glossaryUrls.has(href)).toBeTruthy();
    }
  });
});
