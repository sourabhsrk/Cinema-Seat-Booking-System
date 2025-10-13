import {useMemo, useState} from 'react';

type Seat = {
    id: string,
    row: number,
    seat: number,
    type: string,
    price: number,
    color: ColorTypes,
    status: "booked" | "available",
    selected: boolean
};

type SeatInfo = {
    name: string,
    price: number,
    rows: number[]
};

type SeatTypes = Record<string, SeatInfo>;

type layoutType = {
    rows: number,
    seatsPerRow: number,
    aislePosition: number,
}

type seatBookingPropTypes = {
    title?: string,
    subtitle?: string,
    onBookingComplete?: (data?: any) => void,
    currency?: string,       // for now its string we can define it more precisely later on
    bookedSeats?: string[],
    seatTypes?: SeatTypes,
    layout?: layoutType
}

type ColorTypes = "blue" | "yellow" | "pink" | "green" | "gray";

type SeatTypeInfo = {
    type?: string,
    color?: ColorTypes,
    price?: number
};

const CinemaSeatBooking = ({
    layout = {
        rows: 8,
        seatsPerRow: 12,
        aislePosition: 5,
    },
    seatTypes = {
        regular: {name: "Regular", price: 150, rows: [0,1,2]},
        gold: {name: "Gold", price: 350, rows: [3,4,5]},
        platinum: {name: "Platinum", price: 650, rows: [6,7]},
    },
    bookedSeats = [],
    currency = "₹",
    onBookingComplete = () => {},
    title = "Cinema Hall Booking",
    subtitle = "Select your preferred seats",
}: seatBookingPropTypes) => {
    const getSeatType = (row: number):SeatTypeInfo => {
        for(const [type, config] of Object.entries(seatTypes)){
            if(config.rows.includes(row)){
                let color: ColorTypes = 'blue';
                if(type == 'gold') {
                    color = 'yellow';
                } else if(type == 'platinum') {
                    color = 'pink';
                }
                return {type, color, price: config.price};
            }
        }
        return {};
    }
    const initializeSeats = useMemo(()=>{
        const seats = [];
        for(let row=0; row < layout.rows; row++){
            const seatRow: Seat[] = [];
            const seatTypeInfo = getSeatType(row);
            for(let seat=0; seat<layout.seatsPerRow; seat++){
                const seatId = `${String.fromCharCode(65+row)}${seat+1}`;
                seatRow.push({
                    id: seatId,
                    row,
                    seat,
                    type: seatTypeInfo?.type || "regular",
                    price: seatTypeInfo?.price || 150,
                    color: seatTypeInfo?.color || "blue",
                    status: bookedSeats.includes(seatId) ? "booked" : "available",
                    selected: false
                })
            }
            seats.push(seatRow);
        }
        return seats;
    },[layout,seatTypes,bookedSeats]);
    const [seats, setSeats] = useState(initializeSeats);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const getColorClass = (color: ColorTypes) => {
        const colorMap = {
            blue: "bg-blue-100 border-blue-300 text-blue-600 hover:bg-blue-200",
            yellow: "bg-yellow-100 border-yellow-300 text-yellow-600 hover:bg-yellow-200",
            pink: "bg-pink-100 border-pink-300 text-pink-600 hover:bg-pink-200",
            green: "bg-green-500 border-green-600 text-white",
            gray: "bg-gray-400 border-gray-500 text-gray-600"
        };
        return colorMap[color] || colorMap.blue;
    }
    const getClassName = (seat: Seat) => {
        const baseClass = "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 m-1 rounded-t-lg bg-blue-100 text-blue-300 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200";

        if(seat?.status === "booked") {
            return `${baseClass} bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed`;
        }
        if(seat.selected) {
            return `${baseClass} cursor-pointer bg-green-500 border-green-600 text-white transform scale-110`;
        }
        return `${baseClass} cursor-pointer ${getColorClass(seat.color)}`;
    }

    const handleSeatClick = (rowIdx:number, seatIdx:number) => {
        const seat: Seat = seats[rowIdx][seatIdx];        // this is the seat where user clicked it
        if(seat.status === "booked") return;         // if already booked then we return it
        // now we need to toggle the seat 
        const isCurrentlySelected = seat.selected;     // we need this information to update my selected seats array
        setSeats(prev => {
            return prev.map((r,i) => {
                if(i === rowIdx){
                    return r.map((s,si) => {
                        if(si === seatIdx){
                            return {...s, selected: !s.selected};
                        }
                        return s;
                    })
                }
                return r;
            })
        })
        if(isCurrentlySelected) {
            // if currently selected means : user reclicks on selected seats so remove the seat from selected seats
            setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
        } else {
            // prev not selected so add it now
            setSelectedSeats(prev => [...prev, seat]);
        }
    }

    const renderSeatSection = (seatRow: any[], startIdx: number, endIdx: number) => {
        return (
            <div className='flex'>
                {seatRow.slice(startIdx,endIdx)?.map((seat,idx) => {
                    return <div className={getClassName(seat)} key={seat.id} 
                    onClick={()=>handleSeatClick(seat.row, startIdx+idx)}>
                            {startIdx + idx + 1}   
                        </div>
                })} 
            </div>
        )
    }

    const getTotalPrice = ():number => {
        return selectedSeats.reduce((total:number,seat:Seat) => total + seat.price,0);
    }

    const handleBooking = () => {
        // here i need to update my seats data i.e status to be booked and empty my selectedSeats
        // plus show the successfull msg to user
        setSeats(prevSeats => {
            return prevSeats.map(row => (
                row.map(seat => {
                    if(selectedSeats.some(selected => selected.id === seat.id)){
                        // this means this seat is in the selectedSeats array
                        return {...seat, status: "booked", selected: false};
                    }
                    return seat;
                })
            ))
        });
        onBookingComplete({
            BookedSeats: selectedSeats,
            totalPrice: getTotalPrice()
        })
        alert('Booking Done');
        setSelectedSeats([]);
    }
  return (
    <div className='w-full min-h-screen bg-gray-50 p-4'>
      {/* title */}
      <div className='max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6'>
        <h1 className='text-2xl lg:text-3xl font-bold text-center mb-2 text-gray-800'>{title}</h1>
        <p className='text-center text-gray-600 mb-6'>{subtitle}</p>
      {/* screen */}
      <div className='mb-8'>
        <div className='w-full h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 mb-2 shadow-inner rounded-lg clip-curve'/>
        <p className='text-center text-sm font-medium text-gray-500'>SCREEN</p>
      </div>
      {/* seat map */}
      <div className='mb-6 overflow-x-auto'>
        <div className='flex flex-col items-center min-w-max'>
            {seats?.map((row,rowIdx) => {
                return (
                    <div className='flex items-center mb-2' key={rowIdx}>
                        <span className='w-8 text-center font-bold text-gray-600 mr-4'>
                            {String.fromCharCode(65+rowIdx)}
                        </span>
                        {renderSeatSection(row,0,layout.aislePosition)}
                        {/* aisle */}
                        <div className='w-8'/>
                        {renderSeatSection(row,layout.aislePosition,layout.seatsPerRow)}
                    </div>
                )
            })}
        </div>
      </div>
      {/* legend  */}
      <div className='flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg'>
        {Object.entries(seatTypes).map(([type,config]) => {
            const color = type==='platinum' ? 'pink': type==='gold' ? 'yellow' : 'blue';
            return (
                <div key={type} className='flex items-center'>
                    <div className={`h-6 w-6 border-2 rounded-t-lg mr-2 ${getColorClass(color)} pointer-events-none`}/>
                    <span className='text-sm'>
                        {config.name} ({currency}{config.price})
                    </span>
                </div>
            )
        })}
        <div className='flex items-center'>
            <div className={`w-6 h-6 border-2 rounded-t-lg mr-2 ${getColorClass('green')}`}/>
            <span>Selected</span>
        </div>
        <div className='flex items-center'>
            <div className={`w-6 h-6 border-2 rounded-t-lg mr-2 ${getColorClass('gray')}`}/>
            <span>Booked</span>
        </div>
      </div>
      {/* summary  */}
      <div className='bg-gray-50 rounded-lg p-4 mb-4'>
        <h3 className='font-bold text-lg mb-2'>Booking Summary</h3>
        {selectedSeats.length > 0 ? (
            <div>
                <p className='mb-2'>
                    Selected Seats:{" "}
                    <span className='font-medium'>
                        {selectedSeats?.map(s => s.id).join(", ")}
                    </span>
                </p>
                <p className='mb-2'>
                    Number of Seats:{" "}
                    <span className='font-medium'>{selectedSeats.length}</span>
                </p>
                <p className='text-xl font-bold text-green-600'>
                    Total: {currency}{getTotalPrice()}
                </p>
            </div>
        ) : (
            <p className='text-gray-500'>No Seats Selected</p>
        )}
      </div>
      {/* book button */}
      <button
      onClick={handleBooking} 
      disabled={selectedSeats.length === 0}
      className={`w-full py-3 px-5 rounded-3xl font-bold text-lg transition-all duration-200 
        ${selectedSeats.length > 0
            ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-103'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}>
        {
            selectedSeats.length > 0
            ? `Book ${selectedSeats.length} Seats for ${currency}${getTotalPrice()}`
            : 'Select Seats to Book'
        }
      </button>
      </div>
    </div>
  )
}

export default CinemaSeatBooking;
