from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import loader


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

    email_message.send()
