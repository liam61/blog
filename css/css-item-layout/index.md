# CSS 列表项布局技巧

正确处理列表项中 margin-right 和 margin-bottom

## 一、元素宽度已知，即知道每行最多多少个，且所有元素都在一个容器中

思路：item 在一个容器中，每第三个去掉 margin-right，最后三个取消 margin-bottom（如最后一行不满 3 个也不影响）

### 关键代码

```html
<div class='container'>
  <div class='item'>宽度已知，最多放三个</div>
  <div class='item'>宽度已知，最多放三个</div>
  <div class='item'>宽度已知，最多放三个</div>
  ...
</div>

<style>
/* scss code */
.container {
  .item {
    margin-right: 30px;
    margin-bottom: 20px;

    &:nth-child(3n) { margin-right: 0; }
    &:nth-last-child(-n+3) { margin-bottom: 0; }
  }
}
</style>
```

### 完整代码

- [1.元素宽度已知，所有元素都在一个容器](./1.元素宽度已知，所有元素都在一个容器.html)

## 二、元素宽度已知 或 未知，且元素按照行数在相应容器中

思路：最后一个 container 去掉 margin-bottom，最后一个 item 去掉 magin-right

### 关键代码

```html
<div class='container'>
  <div class='item'></div>
  <div class='item'></div>
</div>
<div class='container'>
  <div class='item'></div>
  <div class='item'></div>
  <div class='item'></div>
</div>
<div class='container'>
  <div class='item'></div>
</div>

<style>
/* scss code */
.container {
  margin-bottom: 20px;
  &:last-child { margin-bottom: 0; }

  .item {
    margin-right: 30px;
    &:last-child { margin-right: 0; }
  }
}
</style>
```

### 完整代码

- [2.元素宽度已知或未知，且按照行数在相应容器](./2.元素宽度已知或未知，且按照行数在相应容器.html)

## 三、元素宽度未知，即不知道一行最多多少个，且所有元素都在一个容器中，常见于 flex 布局

思路：用一个 wrapper 包在最外层，container 设置 负的 margin 来抵消 item 的 外边距

- 参考链接：[https://segmentfault.com/q/1010000005882081/a-1020000005894468](https://segmentfault.com/q/1010000005882081/a-1020000005894468)

### 关键代码

```html
<div class="wrapper">
  <div class='container'>
    <div class='item'>两个才能成一行呀</div>
    <div class='item'>两个才能成一行呀</div>
    <div class='item'>这三个字</div>
    <div class='item'>独成一行呀独成一行呀独成一行呀独</div>
    <div class='item'>两个才能成一行呀</div>
    <div class='item'>四个</div>
  </div>
</div>

<style>
/* scss code */
.wrapper {
  padding: 10px;
  border: 2px solid rgb(240, 103, 103);

  .container {
    display: flex;
    flex-wrap: wrap;
    margin-right: -30px;
    margin-bottom: -20px;

    .item {
      margin-right: 30px;
      margin-bottom: 20px;
    }
  }
}
</style>
```

### 完整代码

- [3.元素宽度未知，且所有元素都在一个容器](./3.元素宽度未知，且所有元素都在一个容器.html)
