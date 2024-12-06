const express = require('express');
const router = express.Router();
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');  

router.use(express.json());
router.use(cors());



module.exports = router;


