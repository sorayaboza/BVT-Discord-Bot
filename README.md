# BVT-Discord-Bot
### BVT's Discord Bot. Collects voice data of BVT interns on Discord calls.


Prerequisits: MySQL and Nodejs.

To run:
1. Type 'npm i' in terminal.
2. Create a `.env` file. Info on contents below this list.
3. Run schema.sql by opening the file, then clicking `Ctrl+A > Right Click > Run MySQL Query` to create the database.
4. Type `nodemon discbot` in the terminal to run the app.

.env file:
```javascript
MYSQL_HOST='127.0.0.1'
MYSQL_USER='root'
MYSQL_PASSWORD='your_mysql_pass_here'
MYSQL_DATABASE='voicedata_app'
TOKEN = 'your_disc_token_here'
```

## Helpful Youtube Videos

[MySQL Installation](https://www.youtube.com/watch?v=wgRwITQHszU)

[MySQL in VS Code](https://youtu.be/4KXLY5Sf2fU?si=HIIWXU9mSu5S9rWt) --> ([Use this resource to fix ER_NOT_SUPPORTED error](https://stackoverflow.com/questions/62260725/er-not-supported-auth-mode-client-does-not-support-authentication-protocol-requ?newreg=4193581bc350422b8134d71293f9d924))

Nodejs install:
 - [Windows 10](https://www.youtube.com/watch?v=__7eOCxJyow)
 - [Windows 11](https://youtu.be/06X51c6WHsQ?si=vLYfu6DtUl5J7xb0)

[Nodejs + MySQL](https://www.youtube.com/watch?v=Hej48pi_lOc&t=34s)