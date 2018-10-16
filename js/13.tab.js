$$('nav').forEach(function(nav, index) {
  nav.addEventListener('click', function(ev) {
    ev = ev || window.event; // 兼容
    var target = ev.target || ev.srcElement;

    if (target.nodeName !== 'A') { return; } // 点在 nav 上

    resetNav(nav);
    target.className = 'selected';
    resetContentByNav(nav, target.textContent);

    // ev.preventDefault();
    // ev.stopPropagation();
  });
});

function resetNav(nav) {
  if (!nav.nodeType || nav.nodeType !== 1) { return; }

  var children = Array.prototype.slice.call(nav.children);
  children.forEach(function(item, index) { item.className = ''; });
}

function resetContentByNav(nav, feature) {
  if (!nav.nodeType || nav.nodeType !== 1) { return; }

  var content = nav.nextElementSibling; // 比 nextSibling 性能好
  var navType = nav.className;
  content.textContent = navType.charAt(0).toUpperCase() + navType.slice(1) +' Content ' + feature;
}