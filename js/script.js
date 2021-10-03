'use strict'

const searchInput = document.querySelector('.search__field')
const btnSearch = document.querySelector('.search__btn')
const infoPanel = document.querySelector('.info-panel')
const ipInfo = document.querySelector('#ip')
const locationInfo = document.querySelector('#location')
const timezoneInfo = document.querySelector('#timezone')
const ispInfo = document.querySelector('#isp')
const mapSectionContainer = document.querySelector('.map-section-container')
const mapContainer = document.querySelector('.map-container')
let mymap = L.map('mapid', { zoomControl: false })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('resize', function () {
	positionInfoTable()
})

btnSearch.addEventListener('click', (e) => {
	e.preventDefault()
	// Clear map container and hide info table
	if (mapSectionContainer.getElementsByClassName('errMsg').length > 0) {
		mapSectionContainer
			.getElementsByClassName('errMsg')[0]
			.parentNode.removeChild(
				mapSectionContainer.getElementsByClassName('errMsg')[0]
			)
	}
	mapContainer.classList.add('hidden')
	infoPanel.classList.add('hidden')

	// Get input and clear input field
	const input = searchInput.value
	searchInput.value = ''
	searchInput.blur()

	// If searching IP
	if (isValidIP(input)) {
		const flag = 'ip'
		renderPage(input, flag)
		return
	}

	// Else domain
	const flag = 'domain'
	renderPage(input, flag)
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

const positionInfoTable = function () {
	const panelHeight = infoPanel.clientHeight
	infoPanel.style.marginBottom = `-${Math.round(panelHeight / 2)}px`
}

const isValidIP = (str) => {
	const arr = str.split('.')
	if (arr.length !== 4) return false
	for (let i = 0; i < 4; i++) {
		if (isNaN(arr[i]) || +arr[i] < 0 || +arr[i] > 255) return false
	}
	return true
}

// const isValidDomain = (str) => {
// 	let url
// 	try {
// 		url = new URL(str)
// 	} catch (_) {
// 		return false
// 	}
// 	return true
// }

const toggleLoading = function () {
	if (mapSectionContainer.getElementsByClassName('loader').length > 0) {
		mapSectionContainer
			.getElementsByClassName('loader')[0]
			.parentNode.removeChild(
				mapSectionContainer.getElementsByClassName('loader')[0]
			)
	} else {
		const markup = `
				<img class="loader" src="images/loading-animation.gif"></img>
		`
		mapSectionContainer.insertAdjacentHTML('afterbegin', markup)
	}
}

const renderErrorMessage = function (msg) {
	const markup = `
	<div class="errMsg" style="text-align:center;max-width:80%;">
		<img src="images/error.png" style="margin-bottom:2rem;">
		<p>${msg}</p>
	</div>
	`
	mapSectionContainer.insertAdjacentHTML('afterbegin', markup)
}

const getData = function (input, flag) {
	const api_key = 'at_wLU6t6A5Xu2X6MRKo6PVgR64FEnOe'
	let url = 'https://geo.ipify.org/api/v1?'

	// Build URL
	switch (flag) {
		case 'ip':
			url += `apiKey=${api_key}&ipAddress=${input}`
			break
		case 'domain':
			url += `apiKey=${api_key}&domain=${input}`
			break
		default:
			url += `apiKey=${api_key}`
			break
	}
	// Fetch data
	return fetch(url).then((res) => {
		if (!res.ok) throw new Error(res.status)
		return res.json()
	})
}

const renderMap = (lat, lng) => {
	// Load map
	mapContainer.classList.remove('hidden')
	mymap.remove()
	mymap = L.map('mapid', { zoomControl: false }).setView([lat, lng], 15)

	// Add custom marker
	L.marker([lat, lng], {
		icon: L.icon({
			iconUrl: '../images/icon-location.svg',
			iconSize: [46, 56],
			iconAnchor: [23, 55],
		}),
	}).addTo(mymap)

	// Add tiles
	L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(mymap)
}

const renderInfoTable = (data) => {
	ipInfo.textContent = data.ip
	locationInfo.textContent = `${data.location.city}, ${data.location.country}`
	timezoneInfo.textContent = `UTC ${data.location.timezone}`
	ispInfo.textContent = data.isp
	infoPanel.classList.remove('hidden')
	positionInfoTable()
}

const renderPage = async function (input, flag) {
	toggleLoading()
	try {
		// Get data
		const data = await getData(input, flag)
		toggleLoading()
		// Show info
		renderInfoTable(data)
		// Show map
		const latitude = data.location.lat
		const longtitude = data.location.lng
		renderMap(latitude, longtitude)
	} catch (err) {
		toggleLoading()
		renderErrorMessage('Input is neither a valid IP neither a valid domain!')
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// RUN
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// renderPage()
