/**
 * 冒泡排序（Bubble Sort）
 * 思路：反复遍历数组，比较相邻元素，逆序则交换；
 *       每一轮把未排序部分的最大值“冒泡”到末尾。
 * 复杂度：时间 O(n²)（带提前退出优化，最好情况 O(n)），空间 O(1) 原地排序，稳定。
 */
function bubbleSort(input) {
  var arr = input.slice(); // 不修改原数组
  var n = arr.length;

  for (var end = n - 1; end > 0; end--) {
    var swapped = false;

    for (var i = 0; i < end; i++) {
      if (arr[i] > arr[i + 1]) {
        var tmp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = tmp;
        swapped = true;
      }
    }

    if (!swapped) break; // 本轮无交换说明已有序，提前退出
  }
  return arr;
}

/* 浏览器环境挂载 */
if (typeof window !== "undefined") window.bubbleSort = bubbleSort;

/* Node 下 `node algorithms/bubble-sort.js` 直接运行时的自检 */
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  var cases = [
    [], [42], [3, 1, 2], [5, 4, 3, 2, 1], [1, 2, 2, 1, 3, 3],
    Array.from({ length: 200 }, function () { return Math.floor(Math.random() * 1000) - 500; }),
  ];
  cases.forEach(function (c, i) {
    var expected = c.slice().sort(function (a, b) { return a - b; });
    var got = bubbleSort(c);
    var ok = JSON.stringify(expected) === JSON.stringify(got);
    if (!ok) { console.error("✘ case", i); process.exit(1); }
  });
  console.log("✔ bubbleSort 全部用例通过");
}
