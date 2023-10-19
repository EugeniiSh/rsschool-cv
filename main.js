const headerBlock = document.querySelector('.header');
const nav = document.querySelector('.nav');
const navList = document.querySelector('.nav-list');

const headerArrow = document.querySelector('.header-arrow');
const arrowBlock = document.querySelector('.arrow-block');


headerArrow.addEventListener('click', () =>
{
    headerBlock.classList.toggle('activ-burger');
    arrowBlock.classList.toggle('activ-arrow-block');
    arrowBlock.classList.toggle('activ-arrow');
});

window.addEventListener('click', (event) =>
{
    if((event.target != nav)
    && (event.target != navList) 
    && (event.target != headerArrow)
    && (event.target != arrowBlock)
    && (event.target.className.slice(0, 10) != 'arrow-item'))
    {
        headerBlock.classList.remove('activ-burger');
        arrowBlock.classList.remove('activ-arrow-block');
        arrowBlock.classList.remove('activ-arrow');
    }
    // console.log(event);
    // console.log(event.target.className);
    // console.log(event.target.className.slice(0, 10));
    // console.log(event.target);
});