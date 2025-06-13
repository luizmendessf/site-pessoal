document.addEventListener('DOMContentLoaded', function() {
  // Menu Hamburguer Responsivo
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');

  if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
          nav.classList.toggle('active');
          const icon = menuToggle.querySelector('i');
          if (icon.classList.contains('fa-bars')) {
              icon.classList.remove('fa-bars');
              icon.classList.add('fa-times');
          } else {
              icon.classList.remove('fa-times');
              icon.classList.add('fa-bars');
          }
      });

      document.querySelectorAll('header nav ul li a').forEach(link => {
          link.addEventListener('click', () => {
              if (nav.classList.contains('active')) {
                  nav.classList.remove('active');
                  const icon = menuToggle.querySelector('i');
                  icon.classList.remove('fa-times');
                  icon.classList.add('fa-bars');
              }
          });
      });
  }

  const header = document.querySelector('header');
  if (header) {
      window.addEventListener('scroll', function() {
          if (window.scrollY > 50) {
              header.classList.add('scrolled');
          } else {
              header.classList.remove('scrolled');
          }
      });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
      contactForm.addEventListener('submit', function(event) {
          event.preventDefault();
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const message = document.getElementById('message').value;

          if (!name || !email || !message) {
              alert('Por favor, preencha todos os campos obrigatórios.');
              return;
          }
          if (!validateEmail(email)) {
              alert('Por favor, insira um endereço de e-mail válido.');
              return;
          }
          console.log('Formulário enviado (simulação):', { name, email, message });
          alert('Mensagem enviada com sucesso! (Simulação)\nEntraremos em contato em breve.');
          contactForm.reset();
      });
  }

  function validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
  }

  const navLinks = document.querySelectorAll('header nav ul li a, footer nav ul li a');
  navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href && href.startsWith('#')) { // Adicionado check se href existe
              e.preventDefault();
              const targetId = href.substring(1);
              const targetElement = document.getElementById(targetId);
              if (targetElement && header) { // Adicionado check se header existe
                  const headerOffset = header.offsetHeight;
                  const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
              } else if (targetElement) { // Fallback se header não for encontrado
                   window.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
              }
          }
      });
  });

  const sections = document.querySelectorAll('main section[id]');
  function activateMenuAtCurrentSection() {
      if (!header) return;
      let scrollY = window.pageYOffset;
      const headerHeight = header.offsetHeight;

      sections.forEach(current => {
          const sectionHeight = current.offsetHeight;
          const sectionTop = current.offsetTop - headerHeight - 50;
          let sectionId = current.getAttribute('id');
          const headerLink = document.querySelector('header nav a[href="#' + sectionId + '"]');
          const footerLink = document.querySelector('footer nav a[href="#' + sectionId + '"]');

          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
              if (headerLink) headerLink.classList.add('active');
              if (footerLink) footerLink.classList.add('active');
          } else {
              if (headerLink) headerLink.classList.remove('active');
              if (footerLink) footerLink.classList.remove('active');
          }
      });
  }
  if (sections.length > 0) {
     window.addEventListener('scroll', activateMenuAtCurrentSection);
     activateMenuAtCurrentSection();
  }

  // --- LÓGICA DO CARROSSEL DE PROJETOS ---
  const carouselContainer = document.querySelector('.carousel-container'); // Adicionado para pegar o container que tem overflow:hidden
  const carousel = document.querySelector('.project-carousel'); // Este é o div que se move
  
  if (carouselContainer && carousel) { // Verificações de existência
      const projectCards = Array.from(carousel.querySelectorAll('.project-card'));
      const prevArrow = carouselContainer.querySelector('.carousel-container .prev-arrow');
      const nextArrow = carouselContainer.querySelector('.carousel-container .next-arrow');

      if (projectCards.length > 0 && prevArrow && nextArrow) {
          let currentIndex = 0; 
          let cardBaseWidthPlusMargins = 0; // Largura base de um card + suas margens horizontais

          // Função para calcular a largura base de um card
          function calculateCardBaseWidth() {
              if (projectCards.length === 0) return 0;
              const firstCard = projectCards[0];
              if (!firstCard) return 0;
              const cardStyle = window.getComputedStyle(firstCard);
              const marginLeft = parseFloat(cardStyle.marginLeft) || 0;
              const marginRight = parseFloat(cardStyle.marginRight) || 0;
              // offsetWidth não é afetado por transform:scale, o que é bom para o "slot" do card
              return firstCard.offsetWidth + marginLeft + marginRight;
          }

          // Função principal que atualiza a posição e os estilos dos cards
          function updateCarousel() {
              if (cardBaseWidthPlusMargins === 0 || isNaN(cardBaseWidthPlusMargins)) {
                  console.warn("Largura do card (cardBaseWidthPlusMargins) é inválida:", cardBaseWidthPlusMargins, "em updateCarousel. Tentando recalcular...");
                  cardBaseWidthPlusMargins = calculateCardBaseWidth(); // Tenta recalcular
                  if (cardBaseWidthPlusMargins === 0 || isNaN(cardBaseWidthPlusMargins)) {
                      console.error("Recálculo da largura do card falhou. Carrossel não será atualizado.");
                      return; 
                  }
              }
              
              const carouselViewportWidth = carouselContainer.offsetWidth; // Largura da "janela" visível do carrossel (o pai com overflow:hidden)

              // Cálculo do offset para centralizar o card ATIVO (currentIndex)
              // 1. Calcula a posição da borda esquerda do "slot" do card atual:
              let offsetToCurrentCardSlot = -(currentIndex * cardBaseWidthPlusMargins);

              // 2. Adiciona metade da largura da viewport para trazer essa borda esquerda para o centro da viewport.
              offsetToCurrentCardSlot += carouselViewportWidth / 2;

              // 3. Subtrai metade da largura VISUAL do card ATIVO para centralizá-lo de fato.
              //    A largura visual do card ativo é cardBaseWidthPlusMargins * 1.05 (se scale é 1.05 no CSS)
              const activeCardVisualWidth = cardBaseWidthPlusMargins * 1.05; // Ajuste este 1.05 se o scale no CSS for diferente
              let finalOffset = offsetToCurrentCardSlot - (activeCardVisualWidth / 2);
              
              // Clamping (evitar rolar para muito longe e deixar espaços vazios)
              const totalContentWidth = projectCards.length * cardBaseWidthPlusMargins; // Largura total dos "slots"
              
              if (totalContentWidth <= carouselViewportWidth) { // Se todos os cards (sem scale) cabem na viewport
                  finalOffset = (carouselViewportWidth - totalContentWidth) / 2; // Centraliza o bloco de cards
              } else {
                  // Limite esquerdo: não deixar o primeiro card passar muito do centro para a direita
                  const maxScrollLeft = (carouselViewportWidth / 2) - (cardBaseWidthPlusMargins * 1.05 / 2);
                  // Limite direito: não deixar o último card passar muito do centro para a esquerda
                  const minScrollLeft = (carouselViewportWidth / 2) - totalContentWidth + (cardBaseWidthPlusMargins * 1.05 / 2);
                  
                  finalOffset = Math.max(minScrollLeft, Math.min(maxScrollLeft, finalOffset));
              }
              
              carousel.style.transform = `translateX(${finalOffset}px)`;
              console.log(`currentIndex: ${currentIndex}, cardBaseW: ${cardBaseWidthPlusMargins}, viewportW: ${carouselViewportWidth}, activeVisualW: ${activeCardVisualWidth}, finalOffset: ${finalOffset}`);

              projectCards.forEach((card, index) => {
                  card.classList.remove('active', 'prev', 'next');
                  if (index === currentIndex) {
                      card.classList.add('active');
                  } else if (index === currentIndex - 1) {
                      card.classList.add('prev');
                  } else if (index === currentIndex + 1) {
                      card.classList.add('next');
                  }
              });

              prevArrow.disabled = currentIndex === 0;
              nextArrow.disabled = currentIndex >= projectCards.length - 1;
          }

          // Função chamada na carga e no resize para configurar/reconfigurar
          function setupCarousel() {
              console.log("Setup Carousel / Resize detected");
              cardBaseWidthPlusMargins = calculateCardBaseWidth(); 
              
              if (cardBaseWidthPlusMargins === 0 || isNaN(cardBaseWidthPlusMargins)) {
                  console.error("Não foi possível configurar o carrossel, largura do card é inválida.");
                  if(prevArrow) prevArrow.style.display = 'none';
                  if(nextArrow) nextArrow.style.display = 'none';
                  return;
              }
              if(prevArrow) prevArrow.style.display = ''; // Garante que estejam visíveis
              if(nextArrow) nextArrow.style.display = '';
              

              updateCarousel(); 
          }

          prevArrow.addEventListener('click', () => {
              console.log("Prev arrow clicked. Current currentIndex:", currentIndex);
              if (prevArrow.disabled) return;
              if (currentIndex > 0) {
                  currentIndex--;
                  updateCarousel();
              }
          });

          nextArrow.addEventListener('click', () => {
              console.log("Next arrow clicked. Current currentIndex:", currentIndex);
              if (nextArrow.disabled) return;
              if (currentIndex < projectCards.length - 1) {
                  currentIndex++;
                  updateCarousel();
              }
          });
          
          let resizeTimer;
          window.addEventListener('resize', () => {
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(setupCarousel, 250); 
          });

          // Inicialização com delay para garantir que o DOM e CSS estejam prontos
          setTimeout(() => {
              setupCarousel();
              if(carouselContainer) carouselContainer.classList.add('carousel-ready');
          }, 250); // Aumentei um pouco o delay para segurança

      } else {
          // Tratar casos onde os elementos não são encontrados
          if (prevArrow) prevArrow.style.display = 'none';
          if (nextArrow) nextArrow.style.display = 'none';
          if (projectCards.length === 0) console.warn("Nenhum card de projeto encontrado para o carrossel.");
          else if (!prevArrow || !nextArrow) console.warn("Setas do carrossel não encontradas.");
      }
  } else {
      if (!carouselContainer) console.warn(".carousel-container não encontrado.");
      if (!carousel) console.warn(".project-carousel não encontrado.");
  }
});