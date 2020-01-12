const displayImageBlock = document.getElementById('main');
const selectOrder = document.getElementById('order');
const spinner = document.querySelector('.spinner');

const key = '056c9191c1742aefb28ef2a3d104250693064a07c838bf5f241537df7a46edce';
let currentPage = 1;
let orderValue = 'latest';
let fetching = false;

addImages();

async function getImages(url) {
	fetching = true;
	const response = await fetch(url);
	const data = await response.json();
	return data;
};

async function addImages() {
	try {
		const images = await getImages('https://api.unsplash.com/photos?page=' + currentPage + '&per_page=30&order_by=' + orderValue + '&client_id=' + key);
		spinner.style.display = 'none';
		images.map((image, index) => {
			const alt = image.description ? '"' + image.description + '"' : image.alt_description ? '"' + image.alt_description + '"' : "image";
			if (currentPage === 1 && index < 5) {
				displayImageBlock.innerHTML += `<img src=${image.urls.regular} alt=${alt} />`;
			} else {
				displayImageBlock.innerHTML += `<img data-src=${image.urls.regular} alt=${alt} class="lazy" style="visibility: hidden" />`;
			}
		});
		fetching = false;
		lazyloading();
	} catch (error) {
		alert('Oops! Something went wrong :( Please try again later');
	}
}

window.addEventListener('scroll', () => {
	if ((window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) && fetching === false) {
		currentPage++;
		addImages();
	}
});

selectOrder.addEventListener('change', () => {
	orderValue = selectOrder.value;
	displayImageBlock.innerHTML = '';
	spinner.style.display = 'flex';
	currentPage = 1;
	addImages();
});

function lazyloading() {
	if ('IntersectionObserver' in window) {
	  	const lazyloadImages = document.querySelectorAll('.lazy');
	  	const imageObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const image = entry.target;
					image.src = image.dataset.src;
					image.removeAttribute('data-src');
					image.classList.remove('lazy');
					image.style.visibility = 'visible';
					imageObserver.unobserve(image);
				};
			});
	  	});
	
		lazyloadImages.forEach(image => imageObserver.observe(image));
	} else {  
		let lazyloadThrottleTimeout;
		const lazyloadImages = document.querySelectorAll('.lazy');
		
		function lazyload() {
			if (lazyloadThrottleTimeout) clearTimeout(lazyloadThrottleTimeout);  
		
			lazyloadThrottleTimeout = setTimeout(() => {
				let scrollTop = window.pageYOffset;
				lazyloadImages.forEach(img => {
					if (img.offsetTop < (window.innerHeight + scrollTop)) {
						img.src = img.dataset.src;
						img.classList.remove('lazy');
					};
				});
				if (lazyloadImages.length == 0) { 
					document.removeEventListener('scroll', lazyload);
					window.removeEventListener('resize', lazyload);
					window.removeEventListener('orientationChange', lazyload);
				}
			}, 20);
		}
		
		document.addEventListener('scroll', lazyload);
		window.addEventListener('resize', lazyload);
		window.addEventListener('orientationChange', lazyload);
	}
}