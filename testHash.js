const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$emnIUxLEsUj4fDrWxO90F.PIr9emmTaUO4b4C8FfxRIZJEeaDwG/W';
const password = 'newpassword123';

bcrypt.compare(password, storedHash, (err, isMatch) => {
  if (err) console.error('Error:', err);
  console.log('Password match:', isMatch);
});
