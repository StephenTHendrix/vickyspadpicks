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

    // Define start and end of the valid date range
    const validStartDate = new Date('2024-11-13')
    const validEndDate = new Date('2024-12-15')

    // Parse the available apartment details
    $('.available-apartments__body--apt').each((index, element) => {
      const unitNumber = $(element).find('.unit').text().trim()
      const price = $(element).find('.price').text().trim().replace(/\s+/g, ' ')
      const priceNumber = parseFloat(price.replace('$', '').replace(',', '')) // Convert price to a number
      const details = $(element).find('.apt-details li')
      const bedBath = $(details[0]).text().trim()
      const squareFeet = $(details[1]).text().trim()
      const floor = $(details[2]).text().trim()
      const moveInDateText = $(details[3]).text().replace('Move-in:', '').trim()
      const amenities = $(element).find('.apt-amenities').text().trim()
      const thumbnailUrl = $(element).find('.apt-image img').attr('src') // Extract thumbnail URL

      // Initialize validDate as false
      let validDate = false

      if (moveInDateText.includes('-')) {
        // Handle range format, e.g., "11/20 - 12/10"
        const [startDateStr, endDateStr] = moveInDateText.split('-').map(date => date.trim())

        // Parse start date only
        const startDate = new Date(`2024-${startDateStr.replace('/', '-')}`)

        // Debugging output for the parsed start date
        // console.log(`Unit ${unitNumber} - Move-in Range: ${moveInDateText}`)
        // console.log(
        //   `Parsed Start Date: ${startDate}, Valid Start Date: ${validStartDate}, Valid End Date: ${validEndDate}`
        // )

        // Ensure start date is within the valid range
        validDate = startDate >= validStartDate && startDate <= validEndDate
        // console.log(`Is Valid Start Date (within range): ${validDate}`)
      } else {
        // Handle single date format
        const singleDate = new Date(`2024-${moveInDateText.replace('/', '-')}`)
        validDate = singleDate >= validStartDate && singleDate <= validEndDate

        // Debugging output for single date
        // console.log(
        //   `Unit ${unitNumber} - Move-in Single Date: ${singleDate}, Valid Start Date: ${validStartDate}, Valid End Date: ${validEndDate}`
        // )
        // console.log(`Is Valid Single Date (within range): ${validDate}`)
      }

      // Filter for apartments under $1800, studio or 1 bed, and valid move-in date
      if (priceNumber < 1800 && (bedBath.includes('Studio') || bedBath.includes('1 Bed')) && validDate) {
        apartments.push({
          unit: unitNumber,
          price: price,
          bedBath: bedBath,
          squareFeet: squareFeet,
          floor: floor,
          moveInDate: moveInDateText,
          amenities: amenities,
          thumbnailUrl: thumbnailUrl,
          apartmentComplex: complexName,
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
