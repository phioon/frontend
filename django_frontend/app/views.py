from django.shortcuts import render


def frontend(request):
    return render(request, 'app/index.html')


def frontend_uidb64_token(request, uidb64, token):
    return render(request, 'app/index.html')
