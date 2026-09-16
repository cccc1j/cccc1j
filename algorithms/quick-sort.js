/**
 * 快速排序（Quick Sort）
 * 思路：选一个基准（pivot），把数组划成 “< pivot | = pivot | > pivot” 三段，
 *       再递归排序左右两段（Lomuto 三路划分的简洁变体）。
 * 复杂度：平均时间 O(n log n)，最坏 O(n²)（随机化 pivot 规避），不稳定。
 */
function quickSort(input) {
  var arr = input.slice(); // 不修改原数组
  qsort(arr, 0, arr.length - 1);
  return arr;
}

function qsort(arr, lo, hi) {
  if (lo >= hi) return;

  // 随机化 pivot：避免对“已经有序”的输入退化成 O(n²)
  var r = lo + Math.floor(Math.random() * (hi - lo + 1));
  swap(arr, r, hi);

  // Lomuto 分区：i 指向“小于区”的右边界
  var i = lo - 1;
  for (var j = lo; j < hi; j++) {
    if (arr[j] < arr[hi]) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, hi); // 把 pivot 放到最终位置

  var p = i + 1;
  qsort(arr, lo, p - 1);   // 排序左半
  qsort(arr, p + 1, hi);   // 排序右半
}

function swap(arr, a, b) {
  var t = arr[a]; arr[a] = arr[b]; arr[b] = t;
}

/* 浏览器环境挂载 */
if (typeof window !== "undefined") window.quickSort = quickSort;

/* Node 下 `node algorithms/quick-sort.js` 直接运行时的自检 */
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  var cases = [
    [], [42], [3, 1, 2], [5, 4, 3, 2, 1], [1, 2, 2, 1, 3, 3],
    Array.from({ length: 2000 }, function () { return Math.floor(Math.random() * 10000) - 5000; }),
  ];
  cases.forEach(function (c, i) {
    var expected = c.slice().sort(function (a, b) { return a - b; });
    var got = quickSort(c);
    var ok = JSON.stringify(expected) === JSON.stringify(got);
    if (!ok) { console.error("✘ case", i); process.exit(1); }
  });
  console.log("✔ quickSort 全部用例通过");
}
