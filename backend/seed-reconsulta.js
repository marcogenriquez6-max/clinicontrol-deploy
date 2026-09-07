const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, database: 'hospital_db', user: 'postgres', password: 'postgres' });

c.connect().then(async () => {
  const r = await c.query(`
    INSERT INTO tipo_atencion (nombre, tipo, duracion_minutos, monto, activo)
    SELECT 'Reconsulta', 'reconsulta', 20, 120.00, true
    WHERE NOT EXISTS (SELECT 1 FROM tipo_atencion WHERE tipo = 'reconsulta')
    RETURNING id, nombre, tipo, monto
  `);
  if (r.rows.length > 0) {
    console.log('Inserted reconsulta tipo:', JSON.stringify(r.rows[0]));
  } else {
    console.log('Already exists:');
    const existing = await c.query("SELECT id, nombre, tipo, monto FROM tipo_atencion WHERE tipo = 'reconsulta'");
    existing.rows.forEach(x => console.log(JSON.stringify(x)));
  }
  await c.end();
}).catch(e => { console.error(e); c.end(); });
