const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

router.get('/', tableController.getAllTables); 
router.post('/', verifyToken, isAdmin, tableController.createTable);
router.put('/:id', verifyToken, isAdmin, tableController.updateTable);
router.delete('/:id', verifyToken, isAdmin, tableController.deleteTable);

module.exports = router;