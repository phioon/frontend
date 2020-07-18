import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ')4@_i569!ci89zt71+#bp^9fa%c#2ce+&9izdqkn+7-h60=y2d'

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_auth',
    'knox',
    'api_engine',
    'app'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'django_engine.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_engine.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases
# [START db_setup]
if os.getenv('GAE_APPLICATION', None):
    # Running on production App Engine, so connect to Google Cloud SQL using
    # the unix socket at /cloudsql/<your-cloudsql-connection string>
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'HOST': '/cloudsql/phioon:southamerica-east1:phioon-pgsql',
            'USER': 'frontend_prd',
            'NAME': 'frontend_prd',
            'PASSWORD': '#P1q2w3e4r$Infra',
        }
    }
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = False
elif '/prd/' in os.getcwd() or '\\prd\\' in os.getcwd():
    # Running locally so connect to either a local Postgres instance or connect to
    # Cloud SQL via the proxy. To start the proxy via command line:
    #
    #     $ cloud_sql_proxy -instances=[INSTANCE_CONNECTION_NAME]=tcp:5433
    #
    # See https://cloud.google.com/sql/docs/mysql-connect-proxy
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'HOST': '127.0.0.1',
            'PORT': '5433',
            'USER': 'frontend_prd',
            'NAME': 'frontend_prd',
            'PASSWORD': '#P1q2w3e4r$Infra',
        }
    }
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = True
elif '/dev/' in os.getcwd() or '\\dev\\' in os.getcwd():
    # Running locally
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'HOST': '127.0.0.1',
            'PORT': '5432',
            'USER': 'frontend_dev',
            'NAME': 'frontend_dev',
            'PASSWORD': '#P1q2w3e4r$Infr@',
        }
    }
    # SECURITY WARNING: don't run with debug turned on in production!
    DEBUG = True
# [END db_setup]

# Password Hashers
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissions'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'knox.auth.TokenAuthentication',
    ]
}

REST_AUTH_SERIALIZERS = {
    'PASSWORD_RESET_SERIALIZER': 'rest_auth.serializers.PasswordResetSerializer',
    'PASSWORD_RESET_CONFIRM_SERIALIZER ': 'rest_auth.serializers.PasswordResetConfirmSerializer',
    'PASSWORD_CHANGE_SERIALIZER': 'rest_auth.serializers.PasswordChangeSerializer'
}

from datetime import timedelta
REST_KNOX = {
    'TOKEN_LIMIT_PER_USER': 10,
    'USER_SERIALIZER': 'api_engine.serializers.UserSerializer',
    'TOKEN_TTL': timedelta(hours=4),
    'AUTO_REFRESH': True,
    'MIN_REFRESH_INTERVAL': 10800
}

OLD_PASSWORD_FIELD_ENABLED = True
LOGOUT_ON_PASSWORD_CHANGE = False

# Email Configuration
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'noreply@phioon.com'
EMAIL_HOST_PASSWORD = '#P1q2w3e4r$Noreply'
DEFAULT_FROM_EMAIL = 'P H I O O N <support.noreply@phioon.com>'

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

# UTC is the base time. The entire system stores information on UTC time and then converts it to user's timezone.
# Do not change it! ;)
TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_ROOT = 'static'
STATIC_URL = '/static/'
