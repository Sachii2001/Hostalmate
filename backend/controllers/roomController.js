const Room = require('../models/Room');

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerMonth, capacity, description } = req.body;
    // Get uploaded room image path
    const image = req.file ? req.file.path : '';
  // Create a new room with the provided details
    const newRoom = new Room({
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description,
      image
    });
     // Save the new room to the database

    await newRoom.save();
    res.status(201).json({ message: 'Room created successfully!', newRoom });
  } catch (error) {

  // Handle unexpected room creation errors
    res.status(500).json({ error: error.message });
  }
};

// Get All Rooms
exports.getAllRooms = async (req, res) => {
  try {
    // Retrieve all rooms from the database
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    // Handle unexpected error while retrieving rooms
    res.status(500).json({ error: error.message });
  }
};

// Get One Room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
 // Return an error if the room does not exist
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    res.status(200).json(room);
 // Handle unexpected room retrieval errors
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Update Room
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerMonth, capacity, description } =
      req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }
  // Update only the fields provided in the request
    room.roomNumber = roomNumber ?? room.roomNumber;
    room.roomType = roomType ?? room.roomType;
    room.pricePerMonth = pricePerMonth ?? room.pricePerMonth;
    room.capacity = capacity ?? room.capacity;
    room.description = description ?? room.description;
 // Update the room image if a new image is uploaded
    if (req.file) {
      room.image = req.file.path;
    }
  // Update room availability based on current occupancy
    if (room.currentOccupancy >= room.capacity) {
      room.availabilityStatus = 'Full';
    } else {
      room.availabilityStatus = 'Available';
    }

    await room.save();

    // Handle unexpected room update errors
    res.status(200).json({
      message: 'Room updated successfully',
      room
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Delete Room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
   // Find the room by ID
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }
     // Return an error if the room does not exist
    await room.deleteOne();
  // Delete the room from the database
  } catch (error) {
    res.status(200).json({
      message: 'Room deleted successfully'
    });
 

    // Handle unexpected room deletion errors
   
    res.status(500).json({
      error: error.message
    });
  }
};

// Get Single Room
exports.getRoomById = async (req, res) => {
  try {
       // Find the room using the provided ID
    const room = await Room.findById(req.params.id);
  // Return an error if the room does not exist
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }
 // Return the requested room details
    res.status(200).json(room);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


// Update Room
exports.updateRoom = async (req, res) => {
  try {
    //room dtails from request body
    const {
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description
    } = req.body;
 
    // Find the room by ID
    const room = await Room.findById(req.params.id);
   // Update only the fields provided in the request
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }
   // Update only the fields provided in the request
    room.roomNumber = roomNumber ?? room.roomNumber;
    room.roomType = roomType ?? room.roomType;
    room.pricePerMonth = pricePerMonth ?? room.pricePerMonth;
    room.capacity = capacity ?? room.capacity;
    room.description = description ?? room.description;
 // Update the room image if a new image is uploaded
    if (req.file) {
      room.image = req.file.path;
    }
  // Update room availability based on current occupancy
    if (room.currentOccupancy >= room.capacity) {
      room.availabilityStatus = 'Full';
    } else {
      room.availabilityStatus = 'Available';
    }

    await room.save();
   // Return the updated room
    res.status(200).json({
      message: 'Room updated successfully',
      room
    });

  } catch (error) {
    // Handle unexpected room update errors
    res.status(500).json({
      error: error.message
    });
  }
};


// Delete Room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    await room.deleteOne();

    res.status(200).json({
      message: 'Room deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};