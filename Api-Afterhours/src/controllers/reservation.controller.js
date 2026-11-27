const ReservationModel = require('../models/reservation.models');
const TableModel = require('../models/tabels.models');

exports.createReservation = async (req, res) => {
  try {
    const { table_id, number_of_people, reservation_date, start_time, duration, notes } = req.body;
    const user_id = req.user.id; 

    if (!table_id || !number_of_people || !reservation_date || !start_time || !duration) {
      return res.status(400).json({ success: false, message: 'Semua kolom reservasi wajib diisi' });
    }

    const table = await TableModel.getById(table_id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Meja tidak ditemukan' });
    }

    if (Number(number_of_people) > table.capacity) {
      return res.status(400).json({ success: false, message: `Jumlah orang melebihi kapasitas meja (Maksimal ${table.capacity})` });
    }

    const isAvailable = await ReservationModel.checkAvailability(table_id, reservation_date, start_time, duration);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Maaf, meja sudah dipesan pada jam tersebut. Silakan pilih waktu atau meja lain.' });
    }

    const newId = await ReservationModel.create({
      user_id, table_id, number_of_people, reservation_date, start_time, duration, notes
    });

    res.status(201).json({ 
      success: true, 
      message: 'Reservasi berhasil dibuat. Menunggu konfirmasi admin.', 
      data: { id: newId, status: 'pending' } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await ReservationModel.getByUserId(req.user.id);
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await ReservationModel.getAll();
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    await ReservationModel.updateStatus(id, status);
    res.status(200).json({ success: true, message: `Status reservasi diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};