cd frontend
npm start

cd backend
venv/scripts/activate
python manage.py runserver


python manage.py makemigrations
python manage.py migrate
python manage.py runserver



cd backend
venv/scripts/activate
python manage.py runserver
