CREATE TABLE task (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	due_date DATE NOT NULL,
        done_date DATE DEFAULT NULL,
	reminder_days INTEGER NOT NULL,
	reminder_time TIME NOT NULL,
        account TEXT NOT NULL
);

INSERT INTO task (title, description, due_date, reminder_days, reminder_time, account) VALUES
       ('Doctors appointment', 'Get my eyes checked', '2018-04-29', 1, '17:00:00', 'test@test.com'),
       ('Vaccinate dog', 'Take the little one to the vet', '2018-04-25', 2, '09:00:00', 'test@test.com'),
       ('Go to the airport', 'Pick up father from airport', '2018-04-20', 0, '12:00:00', 'test@test.com'),
       ('Vacations', 'Go to disney world', '2018-05-10', 2, '07:00:00', 'another@test.com'),
       ('Pick up passport', 'Go for it', '2018-05-06', 0, '12:00:00', 'another@test.com');
