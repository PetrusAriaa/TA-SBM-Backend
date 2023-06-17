const express = require('express');
const cors = require('cors');
const Pool = require('pg').Pool;
const hostname = '127.0.0.1';
const app = express();
app.use(express.json());
app.use(cors());
const port = 3300;

const pool = new Pool({
	user: 'petrusariaa',
	database: 'ta_sbm',
	password: 'cherrybomb25',
	port: 5432,
	host: '104.211.49.59',
});

app.get('/api/data', (req, res) => {
	try {
		pool.query('SELECT * FROM sensor_data', (err, result) => {
			if (err) {
				throw err;
			}
			res.status(200).json(result.rows);
		});
	} catch (err) {
		console.error(err);
	}
});

app.get('/api/data/:id', (req, res) => {
	try {
		const id = parseInt(req.params.id);
		pool.query(
			`SELECT * FROM sensor_data WHERE mission_id=${id}`,
			(err, result) => {
				if (err) {
					throw err;
				}
				res.status(200).json(result.rows);
			}
		);
	} catch (err) {
		console.error(err);
	}
});

app.get('/api/mission_data', (req, res) => {
	try {
		pool.query(`SELECT * FROM mission_data`, (err, result) => {
			if (err) {
				throw err;
			}
			res.status(200).json(result.rows);
		});
	} catch (err) {
		console.error(err);
	}
});

app.post('/api/mission_data', (req, res) => {
	const { mission_name } = req.body;
	try {
		pool.query('SELECT mission_id FROM mission_data', (err, result) => {
			if (err) {
				throw err;
			}
			var ids = result.rows;
			var id = [];
			ids.map((data) => {
				id.push(data.mission_id);
			});
			let last = Math.max(...id);
			pool.query(
				`BEGIN;
        INSERT INTO mission_data (mission_id, mission_name)
        VALUES (${last + 1}, '${mission_name}');
        COMMIT;
        ROLLBACK;`,
				(err, result) => {
					if (err) {
						throw err;
					}
					res.status(201).send('Process success');
				}
			);
		});
	} catch (err) {
		console.error(err);
	}
});

app.post('/api/data', (req, res) => {
	const { mission_name, temperature, humidity, velocity } = req.body;
	try {
		pool.query(
			`SELECT mission_id FROM mission_data WHERE mission_name = '${mission_name}'`,
			(err, result) => {
				if (err) {
					throw err;
				}
				var ids = result.rows;
				var id = ids[0].mission_id;
				pool.query(
					`BEGIN;
				INSERT INTO sensor_data (mission_id, timestamp, temperature, humidity, velocity)
				VALUES (${id}, NOW(), ${temperature}, ${humidity}, ${velocity});
				COMMIT;
				ROLLBACK;`,
					(err, result) => {
						if (err) {
							throw err;
						}
						res.status(201).send('Process success');
					}
				);
			}
		);
	} catch (err) {
		console.error(err);
	}
});

app.listen(port, () => {
	console.log(`connection created on http://${hostname}:${port}`);
});
