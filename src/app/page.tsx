import { getApartments } from './api/getApartments'
import { styled } from 'restyle'
import Image from 'next/image'

// Define your color constants (adjust these values to your preference)
const brandRed = '#FF0000'
const brandLightBlue = '#00AEEF'
const brandWhite = '#FFFFFF'
const brandLighterBlue = '#ADE7FF'

export default async function Home() {
  const data = await getApartments()

  return (
    <PageWrapper>
      <Section>
        <SectionTitle>Apartment Listings</SectionTitle>
        <ApartmentList>
          {data.map((apartment, index) => (
            <ApartmentCard key={index}>
              <ApartmentImage>
                <Image
                  src={apartment.thumbnailUrl}
                  alt={`Thumbnail for ${apartment.unit}`}
                  width={300}
                  height={200}
                  quality={75}
                />
              </ApartmentImage>
              <ApartmentDetails>
                <ApartmentTitle>
                  {apartment.apartmentComplex} - {apartment.unit}
                </ApartmentTitle>
                <Price>Price: {apartment.price}</Price>
                <Details>
                  {apartment.bedBath}, {apartment.squareFeet}
                </Details>
                <MoveInDate>Move-in: {apartment.moveInDate}</MoveInDate>
                <Amenities>Amenities: {apartment.amenities}</Amenities>
              </ApartmentDetails>
            </ApartmentCard>
          ))}
        </ApartmentList>
      </Section>
    </PageWrapper>
  )
}

// Styled components using restyle

const PageWrapper = styled('div', {
  padding: '20px',
  backgroundColor: '#F5F5F5',
})

const Section = styled('section', {
  padding: '20px 0',
})

const SectionTitle = styled('h2', {
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: brandRed,
})

const ApartmentList = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
})

const ApartmentCard = styled('div', {
  backgroundColor: '#FFF',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
})

const ApartmentImage = styled('div', {
  width: '100%',
  height: '200px',
  overflow: 'hidden',
})

const ApartmentDetails = styled('div', {
  padding: '15px',
})

const ApartmentTitle = styled('h3', {
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '10px',
})

const Price = styled('p', {
  fontSize: '18px',
  color: brandLightBlue,
  marginBottom: '5px',
})

const Details = styled('p', {
  fontSize: '16px',
  marginBottom: '5px',
})

const MoveInDate = styled('p', {
  fontSize: '14px',
  marginBottom: '10px',
})

const Amenities = styled('p', {
  fontSize: '14px',
  color: '#666',
})
