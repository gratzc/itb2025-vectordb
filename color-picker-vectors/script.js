//Search by name
function filterColorsByName(colors, searchTerm) {
	const cleanSearchTerm = searchTerm.replace(/\s+/g, '').toLowerCase();
	return colors.filter(color =>
		color.color.replace(/\s+/g, '').toLowerCase().includes(cleanSearchTerm)
	);
}


//Search by vector from name
function filterColorsByVector(colors, searchTerm) {
	const cleanSearchTerm = searchTerm.replace(/\s+/g, '').toLowerCase();
	// Find the exact color match first
	const searchColor = colors.find(color =>
		color.color.replace(/\s+/g, '').toLowerCase() === cleanSearchTerm
	);

	if (!searchColor) return [];

	// Calculate distances and sort colors
	return colors
		.map(color => ({
			...color,
			distance: calculateDistance(color.rgb, searchColor.rgb)
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, 5); // Return top 5 closest colors
}


// Calculate Euclidean distance between two RGB vectors
function calculateDistance(rgb1, rgb2) {
	return Math.sqrt(
		Math.pow(rgb1[0] - rgb2[0], 2) +
		Math.pow(rgb1[1] - rgb2[1], 2) +
		Math.pow(rgb1[2] - rgb2[2], 2)
	);
}


async function loadColors() {
	try {
		const response = await fetch('colors.json');
		const colors = await response.json();
		return colors;
	} catch (error) {
		console.error('Error loading colors:', error);
		return [];
	}
}


function createColorCard(color) {
	const card = document.createElement('div');
	card.className = 'color-card';
	card.innerHTML = `
		<div class="color-swatch" style="background-color: ${color.color}"></div>
		<div class="color-info">
			<div class="color-name">${color.color}</div>
			<div class="rgb-values">RGB: ${color.rgb.join(', ')}</div>
		</div>
	`;
	return card;
}


function updateSelectedColor(color) {
	const selectedColor = document.getElementById('selectedColor');
	const selectedColorSwatch = document.getElementById('selectedColorSwatch');
	const selectedColorName = document.getElementById('selectedColorName');
	const selectedColorRGB = document.getElementById('selectedColorRGB');

	selectedColorSwatch.style.backgroundColor = color.color;
	selectedColorName.textContent = color.color;
	selectedColorRGB.textContent = `RGB: ${color.rgb.join(', ')}`;
	selectedColor.classList.add('active');

	// Store the current color for the find similar button
	selectedColor.dataset.currentColor = color.color;
}


function renderColors(colors) {
	const colorGrid = document.getElementById('colorGrid');
	colorGrid.innerHTML = '';
	colors.forEach(color => {
		const card = createColorCard(color);
		card.addEventListener('click', () => updateSelectedColor(color));
		colorGrid.appendChild(card);
	});
}


let vectorChart = null;
function createVectorChart(selectedColor, similarColors) {
	const canvas = document.getElementById('vectorChart');
	const ctx = canvas.getContext('2d');
	const vectorVisualization = document.querySelector('.vector-visualization');

	// Set canvas size to match container
	const container = vectorVisualization;
	canvas.width = container.clientWidth;
	canvas.height = container.clientHeight - 60; // Leave space for legend

	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw grid
	ctx.strokeStyle = '#ddd';
	ctx.lineWidth = 0.5;

	// Draw vertical grid lines
	for (let i = 0; i <= 255; i += 51) {
		const x = (i / 255) * canvas.width;
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
		ctx.stroke();

		// Add labels
		ctx.fillStyle = '#666';
		ctx.font = '10px Arial';
		ctx.fillText(i, x - 10, canvas.height + 15);
	}

	// Draw horizontal grid lines
	for (let i = 0; i <= 255; i += 51) {
		const y = canvas.height - (i / 255) * canvas.height;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
		ctx.stroke();

		// Add labels
		ctx.fillStyle = '#666';
		ctx.font = '10px Arial';
		ctx.fillText(i, 5, y + 5);
	}

	// Draw axis labels
	ctx.fillStyle = '#000';
	ctx.font = '14px Arial';
	ctx.fillText('Red', canvas.width / 2, canvas.height + 35);
	ctx.save();
	ctx.translate(20, canvas.height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText('Green', 0, 0);
	ctx.restore();

	// Draw similar colors
	similarColors.forEach(color => {
		const x = (color.rgb[0] / 255) * canvas.width;
		const y = canvas.height - (color.rgb[1] / 255) * canvas.height;

		ctx.beginPath();
		ctx.arc(x, y, 4, 0, Math.PI * 2);
		ctx.fillStyle = color.color;
		ctx.fill();
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1;
		ctx.stroke();
	});

	// Draw selected color
	const selectedX = (selectedColor.rgb[0] / 255) * canvas.width;
	const selectedY = canvas.height - (selectedColor.rgb[1] / 255) * canvas.height;

	ctx.beginPath();
	ctx.arc(selectedX, selectedY, 6, 0, Math.PI * 2);
	ctx.fillStyle = selectedColor.color;
	ctx.fill();
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.stroke();

	// Add hover effect
	canvas.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Convert canvas coordinates to RGB values
		const rgbX = Math.round((x / canvas.width) * 255);
		const rgbY = Math.round(((canvas.height - y) / canvas.height) * 255);

		// Find closest color
		const allColors = [selectedColor, ...similarColors];
		let closestColor = null;
		let minDistance = Infinity;

		allColors.forEach(color => {
			const distance = Math.sqrt(
				Math.pow(color.rgb[0] - rgbX, 2) +
				Math.pow(color.rgb[1] - rgbY, 2)
			);
			if (distance < minDistance) {
				minDistance = distance;
				closestColor = color;
			}
		});

		// Show tooltip
		if (closestColor && minDistance < 20) {
			canvas.title = `${closestColor.color} (R:${closestColor.rgb[0]}, G:${closestColor.rgb[1]}, B:${closestColor.rgb[2]})`;
		} else {
			canvas.title = '';
		}
	});

	// Show the visualization container
	vectorVisualization.classList.add('active');
}


async function initializeColorPicker() {
	const colors = await loadColors();
	const searchInput = document.getElementById('searchInput');
	const vectorSearchInput = document.getElementById('vectorSearchInput');
	const findSimilarBtn = document.getElementById('findSimilarBtn');
	const showVectorsBtn = document.getElementById('showVectorsBtn');
	const resetBtn = document.getElementById('resetBtn');

	// Initial render
	renderColors(colors);

	// Name-based search functionality
	searchInput.addEventListener('input', (e) => {
		const searchTerm = e.target.value;
		const filteredColors = filterColorsByName(colors, searchTerm);
		renderColors(filteredColors);
	});

	// Vector-based search functionality
	vectorSearchInput.addEventListener('input', (e) => {
		const searchTerm = e.target.value;
		if (searchTerm) {
			const filteredColors = filterColorsByVector(colors, searchTerm);
			renderColors(filteredColors);
		} else {
			renderColors(colors);
		}
	});

	// Find similar colors button functionality
	findSimilarBtn.addEventListener('click', () => {
		const selectedColor = document.getElementById('selectedColor');
		const currentColor = selectedColor.dataset.currentColor;
		if (currentColor) {
			const filteredColors = filterColorsByVector(colors, currentColor);
			renderColors(filteredColors);
		}
	});

	// Show vectors button functionality
	showVectorsBtn.addEventListener('click', () => {
		// Get the currently displayed colors from the grid
		const colorGrid = document.getElementById('colorGrid');
		const displayedColors = Array.from(colorGrid.children).map(card => {
			const colorName = card.querySelector('.color-name').textContent;
			return colors.find(color => color.color === colorName);
		});

		if (displayedColors.length > 0) {
			// Use the first color as the reference point
			const referenceColor = displayedColors[0];
			// Get the other colors as similar colors
			const similarColors = displayedColors.slice(1);
			createVectorChart(referenceColor, similarColors);
		}
	});

	// Reset button functionality
	resetBtn.addEventListener('click', () => {
		// Clear search inputs
		searchInput.value = '';
		vectorSearchInput.value = '';

		// Clear selected color
		const selectedColor = document.getElementById('selectedColor');
		selectedColor.classList.remove('active');
		selectedColor.dataset.currentColor = '';

		// Hide vector visualization
		const vectorVisualization = document.querySelector('.vector-visualization');
		vectorVisualization.classList.remove('active');

		// Clear canvas
		const canvas = document.getElementById('vectorChart');
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Reset to initial color grid
		renderColors(colors);
	});
}

// Initialize the color picker when the page loads
document.addEventListener('DOMContentLoaded', initializeColorPicker);