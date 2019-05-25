FROM python:3.7-slim

RUN mkdir /code
WORKDIR /code

# Install python dependencies
COPY ./requirements.txt /code/
RUN pip install -r requirements.txt

CMD ["python", "server.py"]
