import { Slider } from './_slider.js';
import { data } from './_data.js';

const headerBlock = document.querySelector('.header');
const nav = document.querySelector('.nav');
const navList = document.querySelector('.nav-list');

const headerArrow = document.querySelector('.header-arrow');
const arrowBlock = document.querySelector('.arrow-block');

// +++ === Burger menu === +++

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
});

// --- === Burger menu === ---

// +++ === Slider === +++

const projectSlider = document.querySelector('.projects .slider-container');

const projectSliderSetup = 
{
  slider: projectSlider,
  autoScroll: false,
  paginationStatic: true,
  infinity: true,
}

const projectSliderObj = new Slider(projectSliderSetup);

const sliderLine = projectSlider.querySelector('.slider-line');
sliderLine.addEventListener('click', (event) =>
{
  const dataInfo = event.target.dataset.info;

  if(dataInfo) showModalWindow(data, dataInfo);
});

window.addEventListener('resize',(e) => 
{
  projectSliderObj.setup(projectSlider);
});

// --- === Slider === ---

const courses = document.querySelector('.courses');
courses.addEventListener('click', (event) =>
{
  const dataInfo = event.target.dataset.info;

  if(dataInfo) showModalWindow(data, dataInfo);
});

const languages = document.querySelector('.languages');
languages.addEventListener('click', (event) =>
{
  const dataInfo = event.target.dataset.info;

  if(dataInfo) showModalWindow(data, dataInfo);
});

const modalWindow = document.querySelector('.modal-window');
modalWindow.addEventListener('click', (event) =>
{
  if(event.target.classList.contains('modal-cross') || !event.target.closest('.modal-container'))
  {
    modalWindow.classList.remove('active-modal');
  }
});

function showModalWindow(dataObj, requestStr)
{
  const div = document.createElement('div');
  const span = document.createElement('span');
  const modalWindow = document.querySelector('.modal-window');

  const modalContainer = div.cloneNode();
  modalContainer.classList.add('modal-container');

  const crossBlock = div.cloneNode();
  crossBlock.classList.add('modal-cross');
  modalContainer.append(crossBlock);

  const dataKeys = Object.keys(dataObj[requestStr]);
  dataKeys.forEach(key =>
  {
    let block = div.cloneNode();
    switch(key)
    {
      case 'img':
        const imgTeg = document.createElement('img');
        imgTeg.src = dataObj[requestStr].img;
        imgTeg.alt = requestStr;
        block.append(imgTeg);
        break;

      case 'deploy':
        const aTeg = document.createElement('a');
        const aTegSpan = span.cloneNode();
        aTegSpan.textContent = `${key}: `;

        aTeg.href = dataObj[requestStr].deploy;
        aTeg.target = '_blank';
        aTeg.textContent = 'Link.';
      
        block.append(aTegSpan, aTeg);
        break;

      default:
        block = document.createElement('p');
        const tegSpan = span.cloneNode();
        tegSpan.textContent = `${key}: `;

        block.textContent = `${dataObj[requestStr][key]}`;
        block.prepend(tegSpan);
        break;
    }

    modalContainer.append(block);
  });

  const oldModalContainer = modalWindow.querySelector('.modal-container');

  oldModalContainer ? oldModalContainer.replaceWith(modalContainer) : modalWindow.append(modalContainer);
  
  modalWindow.classList.add('active-modal');
}