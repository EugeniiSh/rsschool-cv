export class Slider
{
  constructor(
    {
      slider = console.log(new Error('Slider object not specified!')), 
      visibleNum = 1, 
      autoScroll = true, 
      paginations = true, 
      arrows = true,
      slideTransition = 1,
      autoScrollTime = 5,
      paginationStatic = false,
      infinity = false,
      opacity = false,
    })
  {
    this.slider = slider; //Объект slider-container
    this.visibleNum = visibleNum; //Количество одновременно видимых слайдов
    this.autoScroll = autoScroll; //Вкл-Откл автопролистывания слайдера
    this.paginations = paginations; //Вкл-Откл пагинанацию для слайдера
    this.arrows = arrows; //Вкл-Откл стрелок влево-вправо
    this.slideTransition = slideTransition; //Время прокрутки слайдов, в секундах
    this.autoScrollTime = autoScrollTime; //Время переключения между слайдами в авто режиме, в секундах
    this.paginationStatic = paginationStatic; //Вкл-Откл статичную пагинанацию для слайдера
    this.infinity = infinity; //Вкл-выкл бесконечный слайдер (через прокрутку по умолчанию)
    this.opacity = opacity; //Вкл-выкл бесконечный слайдер через изчезающие слайды
    this.setup(this.slider); //Обновление текущих значений слайдера
    this.attachEvents();
  }

  setup(slider) 
  {
    this.position = 0; //Текущая позиция слайдера
    this.pagIndex = 0; //Текущая позиция пагинации

    this.sliderLine = slider.querySelector('.slider-line'); //Движущаяся линия слайдера
    this.sliderPaginationBlock = slider.querySelector('.slider-block__pagination'); //Блок для пагинаций

    this.sliderWrapperWidth = slider.querySelector('.slider-block__wrapper').offsetWidth; //Ширина неподвижного окна просмотра
    this.sliderLineWidth = slider.querySelector('.slider-line').scrollWidth; //Ширина всей прокручиваемой линии слайдера
    this.lineItemWidth = slider.querySelector('.slider-line__item').offsetWidth; //Ширина одного элемента линии слайдера
    this.lineItemsNumber = slider.querySelectorAll('.slider-line__item').length; //Количество элементов в линии слайдера
    this.scrollLength = this.lineItemWidth + ((this.sliderLineWidth - (this.lineItemWidth * this.lineItemsNumber)) / (this.lineItemsNumber - 1)); //Длина прокрутки линии слайдера

    this.posX1 = 0; //Координаты начала касания
    this.posX2 = 0; //Координаты конца касания
    this.swipeLength = 0; //Длинна касания
    this.swipeThreshold = this.sliderWrapperWidth / 3; //Длинна касания достаточная для свайпа

    this.createPaginations();

    if(!this.paginations)                    //Скрытие блока пагинации при включённой настройке,
    {                                        //но автопереключение будет продолжаться.
      this.sliderPaginationBlock.classList.add('hiden-block');
    }

    if(!this.arrows)                         //Скрытие стрелок навигации при включённой настройке,
    {                                        //но автопереключение будет продолжаться.
      this.slider.querySelector('.slider__arrow-left').classList.add('hiden-block');
      this.slider.querySelector('.slider__arrow-right').classList.add('hiden-block');
      this.slider.style.justifyContent = 'center';
    }

    // Установка времени прокрутки слайдера, и смены слайдов в авто режиме
    // Если время прокрутки больше чем время смены, то время прокрутки = время смены.
    this.slider.style.setProperty('--slide-transition', this.slideTransition + 's');
    this.slider.style.setProperty('--auto-scroll-time', this.autoScrollTime + 's');
    if(this.slideTransition >= this.autoScrollTime) 
    {
      this.slider.style.setProperty('--slide-transition', (this.autoScrollTime * 0.9) + 's');
    }

    // Установка бесконечного слайдера
    if(this.infinity)
    {
      if(this.opacity)
      {
        // =========================setup INFINITY slider: throught opacity==========================

        this.sliderItems = this.slider.querySelectorAll('.slider-line__item');

        this.sliderItems.forEach(item => item.classList.add('active-opacity-0', 'activ-position-absolute'));
        this.sliderItems[this.pagIndex].classList.remove('active-opacity-0');
      }
      else
      {
        // ============================setup INFINITY slider========================================

        const sliderItems = this.slider.querySelectorAll('.slider-line__item');
        this.sliderItemsArr = [...sliderItems];
      
        this.sliderLine.prepend(sliderItems[sliderItems.length - 1]);
        this.position += this.scrollLength;
        this.sliderLine.style.transform = `translateX(${-this.position}px)`;

        this.slideEnd = true;
      }
    }

    this.goToSlide(this.pagIndex);
  }

  createPaginations() //Создание блоков пагинации
  {
    const pagNum = (this.lineItemsNumber - this.visibleNum) + 1; //Количество пагинации в зависимости от количества одновременно видимых слайдов
    const pagNode = document.createElement('div');
    pagNode.className = 'pagination-block';
    pagNode.innerHTML = '<div class="pagination-block__filler"></div>';
    this.sliderPaginationBlock.innerHTML = '';

    for(let i = 0; i < pagNum; i++)
    {
      this.sliderPaginationBlock.append(pagNode.cloneNode(true));
    }

    this.paginationBlocks = this.slider.querySelectorAll('.pagination-block'); //Все блоки пагинации

    this.paginationBlocks.forEach((item, index) => 
    {                                        
      item.addEventListener('animationend', () => //Установка события на конец анимации пагинации,
      {                                           //для автоматического переключения на следующий слайд
        this.nextSlide();
      });

      item.addEventListener('click', () => //Установка события на переключение слайдов,
      {                                    //при нажатии на пагинацию
        this.goToSlide(index);
      });
    });
  }

  goToSlide(num) 
  {
    if(this.infinity)
    {
      if(this.opacity)
      {
        // =================infinity slider: throught opacity==================

        this.pagIndex = num;

        this.sliderItems.forEach(item => item.classList.add('active-opacity-0'));
        this.sliderItems[this.pagIndex].classList.remove('active-opacity-0');

        this.activatePagination();
      }
      else
      {
        // ===============infinity slider: through insert slides===============

        if(this.slideEnd)
        {
          this.goToInfiSlide = true;
    
          const currentPagIndex = this.pagIndex;
          this.pagIndex = num;
    
          let tempNode = null;
    
          switch(true)
          {
            case ((currentPagIndex + 1) % this.paginationBlocks.length) === num:
              this.nextSlide();
              break;
            case ((num + 1) % this.paginationBlocks.length) === currentPagIndex:
              this.prevSlide();
              break;
            case num > currentPagIndex:
              tempNode = this.sliderLine.children[2];
              this.sliderLine.children[2].replaceWith(this.sliderItemsArr[num]);
              this.sliderLine.append(tempNode);
              this.nextSlide();
              break;
            case num < currentPagIndex:
              tempNode = this.sliderLine.children[0];
              this.sliderLine.children[0].replaceWith(this.sliderItemsArr[num]);
              this.sliderLine.append(tempNode);
              this.prevSlide();
              break;
          }
    
          this.activatePagination();
        }
      }
    }
    else
    {
      // =============default slider: through sliderLine movement=============

      this.position = this.scrollLength * num;
      this.pagIndex = num;
      this.sliderLine.style.transform = `translateX(${-this.position}px)`;

      this.activatePagination();
    }
    

    // ============infinity slider: through sliderLine movement=============

    // if(this.slideEnd)
    // {
    //   this.slideEnd = false;

    //   this.pagIndex = num;

    //   this.clickedSlideIndex = [...this.sliderLine.children].findIndex(item => item === this.sliderItemsArr[num]);

    //   this.position = this.scrollLength * this.clickedSlideIndex;
    //   this.sliderLine.style.transform = `translateX(${-this.position}px)`;
    // }

    // =====================================================================

  }

  nextSlide() 
  {
    if(this.infinity)
    {
      if(this.opacity)
      {
        // ======================infinity slider: through opacity=======================

        if(this.pagIndex < this.lineItemsNumber - 1)
        {
          this.pagIndex++;
        }
        else
        {
          this.pagIndex = 0;
        }
    
        this.sliderItems.forEach(item => item.classList.add('active-opacity-0'));
        this.sliderItems[this.pagIndex].classList.remove('active-opacity-0');
    
        this.activatePagination();
      }
      else
      {
        // =================infinity slider: through collapse-animation=================

        if(this.slideEnd)
        {
          this.slideEnd = false;
    
          this.sliderLine.firstElementChild.classList.add('active-collapse-animation');
    
          for(let i = 1; i <= this.visibleNum + 1; i++)
          {
            this.sliderLine.children[i].classList.add('active-translateX-animation');
          }
    
          this.pagIndex = this.sliderItemsArr.findIndex(item => item === this.sliderLine.children[2]);
          this.activatePagination();
        }
      }
    }
    else
    {
      // ==================default slider: through sliderLine movement================

      if(this.position < ((this.lineItemsNumber - this.visibleNum) * this.scrollLength))
      {
        this.position += this.scrollLength;
        this.pagIndex++;
      }
      else
      {
        this.position = 0;
        this.pagIndex = 0;
      }
  
      this.sliderLine.style.transform = `translateX(${-this.position}px)`;
      this.activatePagination();
    }
  }

  prevSlide() 
  {
    if(this.infinity)
    {
      if(this.opacity)
      {
        // ======================infinity slider: through opacity=======================

        if(this.pagIndex > 0)
        {
          this.pagIndex--;
        }
        else
        {
          this.pagIndex = this.lineItemsNumber - 1;
        }
    
        this.sliderItems.forEach(item => item.classList.add('active-opacity-0'));
        this.sliderItems[this.pagIndex].classList.remove('active-opacity-0');
    
        this.activatePagination();
      }
      else
      {
        // =================infinity slider: through collapse-animation=================

        if(this.slideEnd)
        {
          this.slideEnd = false;
    
          for(let i = 0; i <= this.visibleNum; i++)
          {
            this.sliderLine.children[i].classList.add('active-revtranslateX-animation');
          }
    
          this.sliderLine.prepend(this.sliderLine.lastElementChild);
          this.sliderLine.firstElementChild.classList.add('active-revcollapse-animation');
    
          this.pagIndex = this.sliderItemsArr.findIndex(item => item === this.sliderLine.children[1]);
          this.activatePagination();
        }
      }
    }
    else
    {
      // ==================defaul slider: through sliderLine movement================

      if(this.position > 0)
      {
        this.position -= this.scrollLength;
        this.pagIndex--;
      }
      else
      {
        this.position = (this.lineItemsNumber - this.visibleNum) * this.scrollLength;
        this.pagIndex = this.lineItemsNumber - this.visibleNum;
      }
  
      this.sliderLine.style.transform = `translateX(${-this.position}px)`;
      this.activatePagination();
    }
  }

  updateSlideOrder() //Обновляет расположение слайдов, что бы они шли по порядку, относительно текущего
  {                  //слайда, в режиме бесконечного слайдера
    for(let i = 0; i < this.lineItemsNumber; i++)
    {
      const updateIndex = (i + this.pagIndex + (this.lineItemsNumber - 1)) % this.lineItemsNumber;
      const sliderItems = this.slider.querySelectorAll('.slider-line__item');

      if(sliderItems[i] && sliderItems[i] !== this.sliderItemsArr[updateIndex])
      {
        sliderItems[i].replaceWith(this.sliderItemsArr[updateIndex]);
      }
      else if(!sliderItems[i])
      {
        this.sliderLine.append(this.sliderItemsArr[updateIndex]);
      }
    }

    this.goToInfiSlide = false;
  }

  activatePagination() //Активация пагинации
  {
    if(this.autoScroll) // При активном авто скроле слайдов
    {
      this.paginationBlocks.forEach((item) =>                            //Берём все блоки пагинации;
      {                                                                  //Удаляем стиль анимации для каждого;
        item.firstChild.classList.remove('activ-pagination-animation');  //Для пагинации актуального слайда
        item.classList.remove('activ-pagination-static');                //добавляем стиль анимации;
      })                                                                    
      this.paginationBlocks[this.pagIndex].firstChild.classList.add('activ-pagination-animation');

      if(this.paginationStatic) 
      {
        this.paginationBlocks[this.pagIndex].classList.add('activ-pagination-static');
      }
    }
    else // Без авто скрола слайдов
    {
      this.paginationBlocks.forEach((item) =>                  //Берём все блоки пагинации;
      {                                                        //Удаляем стиль активации для каждого;
        item.firstChild.classList.remove('activ-pagination');  
        item.classList.remove('activ-pagination-static');      
      })                                                        
      
      //Для пагинации актуального слайда добавляем стиль активации
      if(this.paginationStatic) //статичная пагинация
      {
        this.paginationBlocks[this.pagIndex].classList.add('activ-pagination-static');
      }
      else //анимированная пагинация
      {
        this.paginationBlocks[this.pagIndex].firstChild.classList.add('activ-pagination');
      }
      
    }
  }

  attachEvents() 
  {
    const arrowLeft = this.slider.querySelector('.arrow-left__block');
    const arrowRight = this.slider.querySelector('.slider__arrow-right');

    arrowLeft.addEventListener('click', () => this.prevSlide()); //Переключение слайдера влево
    arrowRight.addEventListener('click', () => this.nextSlide());//Переключение слайдера вправо

    this.sliderLine.addEventListener('touchstart', (event) => //Установка события на начало касания
    {
      this.posX1 = event.changedTouches[0].clientX; //Координаты начала касания по оси Х

      const activPagination = this.slider.querySelector('.activ-pagination-animation'); //Текущая активная пагинация
      activPagination.style.animationPlayState = 'paused'; //Ставим анимацию на паузу
    });

    this.sliderLine.addEventListener('touchend', (event) => //Установка события на конец касания
    {
      this.posX2 = event.changedTouches[0].clientX; //Координаты конца касания по оси Х
      this.swipeAction();
  
      this.removePausePagination();
    });

    this.sliderLine.addEventListener('mousedown', (event) => //Установка события на зажатие кнопки мыши (левой)
    {
      this.posX1 = event.clientX; //Координаты клика по оси Х
    });
      
    this.sliderLine.addEventListener('mouseup', (event) => //Установка события на отпускание кнопки мыши (левой)
    {
      this.posX2 = event.clientX; //Координаты отжатия кнопки по оси Х
      this.swipeAction();
    });

    // ==============================INFINITY slider events==============================

    this.sliderLine.addEventListener('animationend', (event) => 
    {
      // clearing selectors after PREV slide
      if(event.target === this.sliderLine.firstElementChild
      && this.sliderLine.firstElementChild.classList.contains('active-revcollapse-animation'))
      {
        this.sliderLine.firstElementChild.classList.remove('active-revcollapse-animation');

        for(let i = 1; i <= this.visibleNum + 1; i++)
        {
          this.sliderLine.children[i].classList.remove('active-revtranslateX-animation');
        }
        
        if(this.goToInfiSlide)
        {
          this.updateSlideOrder();
        }
      }

      // clearing selectors after NEXT slide
      if(event.target === this.sliderLine.firstElementChild
      && this.sliderLine.firstElementChild.classList.contains('active-collapse-animation'))
      {
        for(let i = 1; i <= this.visibleNum + 1; i++)
        {
          this.sliderLine.children[i].classList.remove('active-translateX-animation');
        }

        this.sliderLine.firstElementChild.classList.remove('active-collapse-animation');
        this.sliderLine.append(this.sliderLine.firstElementChild);

        if(this.goToInfiSlide)
        {
          this.updateSlideOrder();
        }
      }

      this.slideEnd = true;
    });

    // ============event for goToSlide: infinity slider: through sliderLine movement=============

    // this.sliderLine.addEventListener('transitionend', (event) => 
    // {
    //   console.log('tut')

    //   if(this.clickedSlideIndex === 0)
    //   {
    //     this.sliderLine.prepend(this.sliderLine.lastElementChild);
    //     this.position += this.scrollLength;
    //     this.sliderLine.style.transform = `translateX(${-this.position}px)`;
    //   }

    //   this.clickedSlideIndex = null;
    //   this.slideEnd = true;
    // });

    // ==================================================================================
  }

  swipeAction()
  {
    this.swipeLength = this.posX1 - this.posX2; //Определение длинны свайпа

    if(Math.abs(this.swipeLength) > this.swipeThreshold) //Сравнение с необходимой длинной свайпа, 
    {                                                    //для прокрутки слайдера
      if(this.swipeLength > 0) this.nextSlide(); //Положительное число => свайп вправо
      if(this.swipeLength < 0) this.prevSlide(); //Отрицательное число => свайп влево
    }
  }

  removePausePagination() //Очистка стилей для завершения паузы анимации
  {
    this.paginationBlocks.forEach((item) =>
    {
      item.firstChild.style = '';
    })
  }
}


// const slider = document.querySelector('.slider-container');

// const sliderSetup = 
// {
//   slider: slider,
//   visibleNum: 1,
//   autoScroll: true,
//   paginations: true,
//   arrows: true,
//   slideTransition: 1,
//   autoScrollTime: 3,
//   paginationStatic: false,
//   infinity: true,
//   opacity: false,
// }

// const sliderObj = new Slider(sliderSetup);


// Разметка:
// Стандартная разметка находится в файле index.html, блок "slider-container" и всё его содержимое.
// Вы можите добавлять свой контент в блоки:
// - arrow-left__block
// - arrow-right__block
// - line-item__block
// - Добавление контента в другие блоки на свой страх и риск.

// Стили:
// Стандартные стили находятся в файле style.css и начинаются с 22-й строки, после слов "Стандартные стили для слайдера".
// - Размер и цвет блоков можно менять на своё усмотрение.
// - Изменить время автоперелистывания - в .activ-pagination-animation заменить цифру 5, на нужную вам (в секундах)
// - Другие стили можно менять если уверены в себе.

// JavaScript:
// Весь код JS находится в файле main.js.

// Установка:
// Для установки слайдера нужно сделать следующее:
// 1. Скопировать разметку, стили и код в свой проект.
// 2. В файле с кодом JS, ниже скопированного кода:
//  - создать переменную для слайдера (например  - slider),
//    и использовать  document.querySelector('.slider-container') что бы найти его в DOM.
//  - создать переменную для объекта настроек (например: sliderSetup),
//    в котором нужно указать следующие параметры:
// 
//        (имена параметров должны строго соответствовать приведённым ниже)
//        (все параметры, кроме slider, не обязательные)
//     -- slider = объект слайдера (например slider, из пункта выше)
//     -- visibleNum = любое целое число.
//      Настраивает количество одновременно видимых элементов слайдера. По умолчанию = 1.
//     -- autoScroll = булевый тип.
//      Вкл-Откл автопролистывания слайдера. По умолчанию = true.
//     -- paginations = булевый тип.
//       Вкл-Откл пагинанацию для слайдера. По умолчанию = true.
//     -- arrows = булевый тип.
//      Вкл-Откл стрелок влево-вправо. По умолчанию = true.
// 
//  - создать переменную для объекта слайдера (например - sliderObj),
//    и использовать конструкцию sliderObj = new Slider(sliderSetup) для инициализации слайдера.
//  - Слайдер готов к работе.

// Для адаптации слайдера можно использовать фукцию: 
// window.addEventListener('resize',(e) => 
// {
  // Здесь меняете стили слайдера
  // После обязательно переинициализируете с помощью sliderObj.setup(slider - переменная для слайдера из DOM)
  // sliderObj.setup(slider);
// });