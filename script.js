document.addEventListener('DOMContentLoaded',()=>{

  const UNSPLASH_KEY = "89akGqLPz9HTLOs7ppweKHa9MYQWPLAJktTmtN_Ukoo";  
  const WEATHER_KEY  = "dfce62e2876cccabcd39a88a9cc3cda0";  

  // DOM elements
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-input');
  const resultsSection = document.getElementById('results');
  const imageGrid = document.getElementById('image-grid');
  const cityName = document.getElementById('city-name');
  const locationName = document.getElementById('location-name');
  const temperature = document.getElementById('temperature');
  const weatherCondition = document.getElementById('weather-condition');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('wind-speed');
  const horizontalGallery = document.getElementById('horizontal-gallery');
  const popularGrid = document.getElementById('popular-grid');
  const eventsGrid = document.getElementById('events-grid');
  const loader = document.getElementById('loader');
  const backToTop = document.querySelector('.back-to-top');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalClose = document.querySelector('.modal-close');
  const popularLocation = document.getElementById('popular-location');
  const eventsLocation = document.getElementById('events-location');

  // Current search location
  let currentLocation = '';

  // Hero background slider
  const heroSlides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;
  
  function changeHeroSlide() {
    // Remove active class from current slide
    heroSlides[currentSlide].classList.remove('active');
    
    // Move to next slide
    currentSlide = (currentSlide + 1) % heroSlides.length;
    
    // Add active class to new slide
    heroSlides[currentSlide].classList.add('active');
  }
  
  // Change slide every 5 seconds
  setInterval(changeHeroSlide, 5000);

  // Initialize popular destinations and events
  initPopularDestinations();
  initEvents();

  // 🌦️ Fetch weather
  async function fetchWeather(city){
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();
      if(data.cod !== 200){ 
        alert("City not found! Please try another location."); 
        loader.style.display = 'none';
        return false; 
      }
      cityName.textContent = data.name;
      locationName.textContent = data.name;
      temperature.textContent = `${Math.round(data.main.temp)}°C`;
      weatherCondition.textContent = data.weather[0].main;
      humidity.textContent = `${data.main.humidity}%`;
      windSpeed.textContent = `${data.wind.speed} km/h`;
      
      // Update the current location
      currentLocation = data.name;
      popularLocation.textContent = data.name;
      eventsLocation.textContent = data.name;
      
      return true;
    } catch(err){ 
      console.error("Weather error:", err); 
      alert("Error fetching weather data. Please try again.");
      loader.style.display = 'none';
      return false;
    }
  }

  // 🖼️ Fetch images
  async function fetchImages(query, container, count = 6, isPopularOrEvents = false){
    try {
      const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&client_id=${UNSPLASH_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      container.innerHTML = "";
      data.results.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'image-card';
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description || query;
        
        // Add overlay with location info
        const overlay = document.createElement('div');
        overlay.className = 'image-card-overlay';
        overlay.innerHTML = `<h3>${query.charAt(0).toUpperCase() + query.slice(1)}</h3>
                            <p>${photo.user.name}</p>`;
        
        card.appendChild(img);
        card.appendChild(overlay);
        container.appendChild(card);
        
        // Add click event to open modal
        card.addEventListener('click', () => {
          modalImage.src = photo.urls.regular;
          modal.classList.add('show');
        });
        
        // Show with animation after a short delay
        setTimeout(() => {
          card.classList.add('show');
        }, 100);
      });
    } catch(err){ 
      console.error("Unsplash error:", err); 
      if (!isPopularOrEvents) {
        alert("Error fetching images. Please try again.");
      }
    } finally {
      if (!isPopularOrEvents) {
        loader.style.display = 'none';
      }
    }
  }

  // 🔍 Handle search
  async function handleSearch(){
    const query = searchInput.value.trim();
    if(!query) {
      alert("Please enter a destination to search.");
      return;
    }
    
    loader.style.display = 'block';
    resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
      resultsSection.scrollIntoView({behavior: 'smooth'});
    }, 300);
    
    const weatherSuccess = await fetchWeather(query);
    if(weatherSuccess) {
      await fetchImages(query, imageGrid, 9);
      
      // Update popular and events based on the searched location
      await fetchImages(`${query} landmarks`, popularGrid, 6, true);
      await fetchImages(`${query} events`, eventsGrid, 6, true);
    }
  }

  // Initialize popular destinations
  async function initPopularDestinations(){
    const popularPlaces = ['Paris', 'Tokyo', 'New York', 'Bali', 'London', 'Rome'];
    for (let i = 0; i < popularPlaces.length; i++) {
      await fetchImages(popularPlaces[i], popularGrid, 1, true);
    }
  }

  // Initialize events
  async function initEvents(){
    const events = ['Christmas Market', 'Summer Festival', 'Autumn Leaves', 'Spring Flowers', 'Winter Sports', 'Carnival'];
    for (let i = 0; i < events.length; i++) {
      await fetchImages(events[i], eventsGrid, 1, true);
    }
  }

  // CTA button scroll
  document.querySelector('.cta-button').addEventListener('click',() => {
    document.getElementById('explore').scrollIntoView({behavior: 'smooth'});
  });

  // Scroll down button
  document.querySelector('.scroll-down').addEventListener('click', () => {
    document.getElementById('explore').scrollIntoView({behavior: 'smooth'});
  });

  // Search events
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') handleSearch();
  });

  // Back to top button
  window.addEventListener('scroll', () => {
    if(window.pageYOffset > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
    
    // Navbar background on scroll
    if(window.pageYOffset > 50) {
      document.querySelector('.navbar').classList.add('scrolled');
    } else {
      document.querySelector('.navbar').classList.remove('scrolled');
    }
  });
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.innerHTML = navLinks.classList.contains('active') ? 
      '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Modal functionality
  modalClose.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  modal.addEventListener('click', (e) => {
    if(e.target === modal) {
      modal.classList.remove('show');
    }
  });

  // Add intersection observer for animation on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, observerOptions);

  // Observe all cards for animation
  document.querySelectorAll('.image-card').forEach(card => {
    observer.observe(card);
  });

  // Add click events to horizontal gallery images
  document.querySelectorAll('.horizontal-scroll img').forEach(img => {
    img.addEventListener('click', function() {
      const altText = this.alt;
      searchInput.value = altText;
      handleSearch();
    });
  });

});