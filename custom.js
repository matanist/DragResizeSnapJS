const slider = interact('.slider');
slider
.draggable({
    origin:'self',
    inertia:true,
    modifiers: [
        interact.modifiers.restrict({
            restriction: 'self',
        })
    ],
    listeners: {
        move(event) {
            const sliderWidth = interact.getElementRect(event.target).width
            const value = event.pageX /sliderWidth

            event.target.style.paddingLeft = (value * 100) + '%';
            event.target.setAttribute('data-value',value.toFixed(2));
        }
    }
})