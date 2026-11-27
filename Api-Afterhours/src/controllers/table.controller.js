const TableModel = require('../models/tabels.models');

exports.getAllTables = async (req, res) => {
  try {
    const tables = await TableModel.getAll();
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.createTable = async (req, res) => {
  try {
    const { table_number, capacity } = req.body;
    if (!table_number || !capacity) {
      return res.status(400).json({ success: false, message: 'Nomor meja dan kapasitas wajib diisi' });
    }
    const newId = await TableModel.create({ table_number, capacity });
    res.status(201).json({ success: true, message: 'Meja berhasil ditambahkan', data: { id: newId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, capacity, status } = req.body;
    await TableModel.update(id, { table_number, capacity, status });
    res.status(200).json({ success: true, message: 'Meja berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    await TableModel.delete(id);
    res.status(200).json({ success: true, message: 'Meja berhasil dihapus' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, message: 'Meja tidak bisa dihapus karena ada riwayat reservasi' });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};