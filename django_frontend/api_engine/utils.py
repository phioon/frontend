from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import loader
from rest_framework import status
import smtplib
import time


# Function copied from class django.contrib.auth.forms.PasswordResetForm
def send_mail(subject_template_name, email_template_name, context, to_email,
              from_email=getattr(settings, 'DEFAULT_FROM_EMAIL'), html_email_template_name=None):
    """
    Send a django.core.mail.EmailMultiAlternatives to `to_email`.
    """

    subject = loader.render_to_string(subject_template_name, context)
    # Email subject *must not* contain newlines
    subject = ''.join(subject.splitlines())
    body = loader.render_to_string(email_template_name, context)

    email_message = EmailMultiAlternatives(subject, body, from_email, [to_email])

    if html_email_template_name:
        html_email = loader.render_to_string(html_email_template_name, context)
        email_message.attach_alternative(html_email, 'text/html')

    obj_res = {"status": status.HTTP_200_OK}

    try:
        email_message.send()
    except smtplib.SMTPConnectError:
        email_message.send()
    except smtplib.SMTPServerDisconnected:
        email_message.send()
    except smtplib.SMTPException:
        obj_res = {"status": status.HTTP_503_SERVICE_UNAVAILABLE}

    return obj_res


# Time
def convert_epoch_to_timestamp(epoch):
    while len(str(epoch)) > 10:
        # It must be in seconds. In case it is miliseconds or nanoseconds, keep dividing
        epoch = epoch / 1000

    timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(epoch))
    return timestamp
