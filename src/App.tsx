import './App.css'
import CinemaSeatBooking from './Components/Cinema-Seat-Booking'

function App() {


  return (
    <>
      <CinemaSeatBooking onBookingComplete={(data: any)=>console.log(data)} bookedSeats={["C1", "C2"]}/>
    </>
  )
}

export default App
