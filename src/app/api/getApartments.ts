import * as cheerio from 'cheerio'

// Function to fetch and parse data from a given URL and complex name
async function fetchUnitData(url, complexName) {
  try {
    // Use fetch to make the API call
    const response = await fetch(url, { cache: 'no-store' }) // Ensure no caching for fresh data
    const html = await response.text()

    // Load the HTML into cheerio
    const $ = cheerio.load(html)

    // Array to hold apartment data for this complex
    const apartments = []

    // Parse the available apartment details
    $('.available-apartments__body--apt').each((index, element) => {
      const unitNumber = $(element).find('.unit').text().trim()
      const price = $(element).find('.price').text().trim().replace(/\s+/g, ' ')
      const priceNumber = parseFloat(price.replace('$', '').replace(',', '')) // Convert price to a number
      const details = $(element).find('.apt-details li')
      const bedBath = $(details[0]).text().trim()
      const squareFeet = $(details[1]).text().trim()
      const floor = $(details[2]).text().trim()
      const moveInDate = $(details[3]).text().replace('Move-in:', '').trim()
      const amenities = $(element).find('.apt-amenities').text().trim()
      const thumbnailUrl = $(element).find('.apt-image img').attr('src') // Extract thumbnail URL

      // Filter for studios or 1-bed apartments and price under $1800
      if (priceNumber < 1800 && (bedBath.includes('Studio') || bedBath.includes('1 Bed'))) {
        // Create an apartment object and push it to the array if it meets the criteria
        apartments.push({
          unit: unitNumber,
          price: price,
          bedBath: bedBath,
          squareFeet: squareFeet,
          floor: floor,
          moveInDate: moveInDate,
          amenities: amenities,
          thumbnailUrl: thumbnailUrl,
          apartmentComplex: complexName, // Include the apartment complex name
        })
      }
    })

    // Return the apartment data for this complex
    return apartments
  } catch (error) {
    console.error(`Error fetching or parsing data from ${complexName}:`, error)
    return [] // Return an empty array on error
  }
}

// Function to fetch data from all 3 apartment complexes in parallel
async function fetchAllUnitData() {
  const urls = [
    { url: 'https://www.maac.com/texas/dallas/maa-worthington/', complex: 'MAA Worthington' },
    { url: 'https://www.maac.com/texas/dallas/maa-heights/', complex: 'MAA Heights' },
    { url: 'https://www.maac.com/texas/dallas/maa-uptown-village/', complex: 'MAA Uptown Village' },
  ]

  // Make the API calls in parallel
  const promises = urls.map(({ url, complex }) => fetchUnitData(url, complex))
  const results = await Promise.all(promises)

  // Combine results from all complexes
  const allApartments = results.flat()

  // Return the combined data
  return allApartments
}

export async function getApartments() {
  try {
    const data = await fetchAllUnitData()
    return data
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return [] // Return empty array in case of failure
  }
}
