/**
 * 归并排序（Merge Sort）
 * 思路：分治——把数组从中间劈成两半，各自递归排序，
 *       再把两个有序子数组“归并”成一个有序数组。
 * 复杂度：时间恒为 O(n log n)，空间 O(n)（需要辅助数组），稳定。
 */
function mergeSort(input) {
  var arr = input.slice(); // 不修改原数组
  if (arr.length < 2) return arr;
  var buf = arr.slice();    // 复用一个辅助数组，避免每层都新建
  msort(arr, buf, 0, arr.length - 1);
  return arr;
}

function msort(arr, buf, lo, hi) {
  if (lo >= hi) return;

  var mid = lo + ((hi - lo) >> 1); // 防溢出写法
  msort(arr, buf, lo, mid);        // 排左半
  msort(arr, buf, mid + 1, hi);    // 排右半
  if (arr[mid] <= arr[mid + 1]) return; // 已有序则跳过归并
  merge(arr, buf, lo, mid, hi);
}

function merge(arr, buf, lo, mid, hi) {
  for (var k = lo; k <= hi; k++) buf[k] = arr[k]; // 快照

  var i = lo, j = mid + 1;
  for (var t = lo; t <= hi; t++) {
    if (i > mid)                 arr[t] = buf[j++]; // 左半取完
    else if (j > hi)             arr[t] = buf[i++]; // 右半取完
    else if (buf[j] < buf[i])    arr[t] = buf[j++]; // 取更小者（<= 保稳定）
    else                         arr[t] = buf[i++];
  }
}

/* 浏览器环境挂载 */
if (typeof window !== "undefined") window.mergeSort = mergeSort;

/* Node 下 `node algorithms/merge-sort.js` 直接运行时的自检 */
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  var cases = [
    [], [42], [3, 1, 2], [5, 4, 3, 2, 1], [1, 2, 2, 1, 3, 3],
    Array.from({ length: 2000 }, function () { return Math.floor(Math.random() * 10000) - 5000; }),
  ];
  cases.forEach(function (c, i) {
    var expected = c.slice().sort(function (a, b) { return a - b; });
    var got = mergeSort(c);
    var ok = JSON.stringify(expected) === JSON.stringify(got);
    if (!ok) { console.error("✘ case", i); process.exit(1); }
  });
  console.log("✔ mergeSort 全部用例通过");
}
