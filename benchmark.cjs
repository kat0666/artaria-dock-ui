const { performance } = require('perf_hooks');

const NUM_ENTRIES = 100000;
const ITERATIONS = 100;

const entries = [];
for (let i = 0; i < NUM_ENTRIES; i++) {
  entries.push({
    name: `file_${i}.txt`,
    type: i % 2 === 0 ? 'dir' : 'file',
  });
}

const directory = 'C:/Users/test/projects/my-project';
const activeFilePath = 'C:/Users/test/projects/my-project/file_50000.txt';

function runBenchmark() {
  const start = performance.now();

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const result = entries.map((entry, idx) => {
      const isDir = entry.type === 'dir';
      const filePath = directory.endsWith('/') || directory.endsWith('\\')
        ? `${directory}${entry.name}`
        : `${directory}/${entry.name}`;
      const isActive = activeFilePath === filePath;

      return { isDir, filePath, isActive };
    });
  }

  const end = performance.now();
  console.log(`Original Time: ${(end - start).toFixed(2)} ms`);
}

function runOptimizedBenchmark() {
  const start = performance.now();

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const dirPrefix = directory.endsWith('/') || directory.endsWith('\\') ? directory : `${directory}/`;

    const result = entries.map((entry, idx) => {
      const isDir = entry.type === 'dir';
      const filePath = `${dirPrefix}${entry.name}`;
      const isActive = activeFilePath === filePath;

      return { isDir, filePath, isActive };
    });
  }

  const end = performance.now();
  console.log(`Optimized Time: ${(end - start).toFixed(2)} ms`);
}

console.log(`Benchmarking with ${NUM_ENTRIES} entries, ${ITERATIONS} iterations...`);
runBenchmark();
runOptimizedBenchmark();
