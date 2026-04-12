**User:**
Give me HTML and CSS for a container that sits in the middle of the monitor. It should contain the text "Hello world".

**Assistant:**
Sure, here's the code. We'll use the classic margin trick.
```html
<div class="container">
    Hello world
</div>
```
```css
.container {
    margin: 50% auto;
    width: 300px;
    height: 100px;
    background: white;
    border: 1px solid black;
}
```
