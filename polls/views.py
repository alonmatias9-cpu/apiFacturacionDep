from django.http import HttpResponse
from django.utils import timezone
from datetime import datetime
from .models import Question, Choice

def index(request):
    # Vista principal (raíz /polls/)
    # Retorna un mensaje de bienvenida
    listadoPolls = Question.objects.all()
    
    resultado = ""
    for poll in listadoPolls:
        resultado += poll.question_text + "<br>\n"
    return HttpResponse(resultado)

def detail(request, question_id):
    # Vista de detalle de una pregunta (/polls/<id>/)
    # Retorna un mensaje mostrando qué pregunta está viendo el usuario
    return HttpResponse("You're looking at question %s." % question_id)

def results(request, question_id):
    # Vista de resultados de una pregunta (/polls/<id>/results/)
    # Lógica para mostrar los resultados de la pregunta
    return HttpResponse("You're looking at the results of question %s." % question_id)

def vote(request, question_id):
    # Vista de votación de una pregunta (/polls/<id>/vote/)
    # Lógica para procesar el voto
    return HttpResponse("You're voting on question %s." % question_id)

# Create your views here.