# animated-filter
Simple CSS animated JS powered filter animations

## Demo
* https://robinpoort.github.io/animated-filter/

## Features
* Powered by JS
* transitions by CSS
* Bare bones, no styling added, you have to do that yourself, see demo page for demos

## Use

```html
<ul data-filter-list>
    <li><a data-filter="all" href="#" class="is-active">All</a></li>
    <li><a data-filter="1" href="#">1</a></li>
    <li><a data-filter="2" href="#">2</a></li>
    <li><a data-filter="3" href="#">3</a></li>
</ul>

<div class="items" data-filter-types>
    <div class="item" data-filter-type="1">1</div>
    <div class="item" data-filter-type="2">2</div>
    <div class="item" data-filter-type="3">3</div>
    <div class="item is-hiding is-hidden" data-filter-type="none">No items found</div>
</div>
```

### Multiple list on one page
Add `data-filter-for="example"` to your lists and add `id="example"` to items parents.

```html
<ul data-filter-list data-filter-for="example">
    ...
</ul>

<div class="items" data-filter-types id="example">
    ...
</div>
```