const db = require('./db');

function identifyHandler(data, res) {
  const { email, phoneNumber } = data;

  if (!email && !phoneNumber) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Email or phoneNumber is required' }));
    return;
  }

  const query = `SELECT * FROM Contact WHERE (email = ? OR phoneNumber = ?) AND deletedAt IS NULL`;

  db.query(query, [email, phoneNumber], (err, rows) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
      return;
    }

    if (rows.length === 0) {
      // No existing contacts, create a new primary contact
      const insertQuery = `INSERT INTO Contact (email, phoneNumber, linkPrecedence, createdAt, updatedAt) VALUES (?, ?, 'primary', NOW(), NOW())`;
      db.query(insertQuery, [email, phoneNumber], function (err, result) {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }

        // Creating a new primary contact
        const newContact = {
          primaryContactId: result.insertId,
          emails: [email].filter(Boolean), // Remove null values
          phoneNumbers: [phoneNumber].filter(Boolean), // Remove null values
          secondaryContactIds: []
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ contact: newContact }));
      });
    } else {
      // Existing contact(s) found
      const primaryContact = rows.find(row => row.linkPrecedence === 'primary');
      const secondaryContacts = rows.filter(row => row.linkPrecedence === 'secondary');

      // Use Set to ensure unique emails and phone numbers, and filter to remove null values
      const emails = new Set([primaryContact.email, ...secondaryContacts.map(row => row.email)].filter(Boolean));
      const phoneNumbers = new Set([primaryContact.phoneNumber, ...secondaryContacts.map(row => row.phoneNumber)].filter(Boolean));

      const responseContact = {
        primaryContactId: primaryContact.id,
        emails: [...emails].filter(Boolean), // Remove null values
        phoneNumbers: [...phoneNumbers].filter(Boolean), // Remove null values
        secondaryContactIds: secondaryContacts.map(row => row.id)
      };

      // If a new secondary contact needs to be created
      if (!rows.some(row => row.email === email && row.phoneNumber === phoneNumber)) {
        const insertQuery = `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence, createdAt, updatedAt) VALUES (?, ?, ?, 'secondary', NOW(), NOW())`;
        db.query(insertQuery, [email, phoneNumber, primaryContact.id], function (err, result) {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
            return;
          }

          // Add new secondary contact ID to the response
          responseContact.secondaryContactIds.push(result.insertId);

          // Add new email and phone number to the Set to ensure uniqueness
          if (email) emails.add(email);
          if (phoneNumber) phoneNumbers.add(phoneNumber);

          responseContact.emails = [...emails].filter(Boolean);
          responseContact.phoneNumbers = [...phoneNumbers].filter(Boolean);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ contact: responseContact }));
        });
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ contact: responseContact }));
      }
    }
  });
}

module.exports = { identifyHandler };