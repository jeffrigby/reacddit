import path from 'path';
import express from 'express';
import morgan from 'morgan';

const app = express();

app.set('port', (process.env.PORT || 3000));

app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, '/dist')))

app.get('*',  (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(app.get('port'), (err) => {
    if (err) {
        console.log(err)
    }
    console.info('==> Listening on port %s.', app.get('port'));
})