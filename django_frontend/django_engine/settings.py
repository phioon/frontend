import os

# P H I O O N
# Variables
API_KEY = 'ycjOzOP5loHPPIbfMW6tA7AreqAlq0z4yqxStxk2B8Iwges581rK5V8kIgg4'
DEFAULT_PWD = 'ycjOzOP5loHPPIbfMW6tA7AreqAlq0z4yqxStxk2B8Iwges581rK5V8kIgg4'

BACKEND_API_USER = 'frontend_api'
BACKEND_API_PWD = '#P1q2w3e4r$Api'
DB_DEFAULT = {
    'ENGINE': 'django.db.backends.postgresql',
    'PASSWORD': '#P1q2w3e4r$Infra',
}

if os.getenv('GAE_APPLICATION', None):
    # [PRD] environment
    DEBUG = False

    BACKEND_HOSTNAME = 'https://backend.phioon.com'
    DB_DEFAULT['HOST'] = '/cloudsql/phioon:southamerica-east1:phioon-pgsql'
    DB_DEFAULT['NAME'] = 'frontend_prd'
    DB_DEFAULT['USER'] = 'frontend_prd'

    STRIPE_API_KEY = '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'
    STRIPE_ENDPOINT_SECRET = 'whsec_HDQTLvk9KtZz5N7Jh50SW8yHHQ20AwBS'

else:
    # [DEV] environment
    DEBUG = True
    ACCESS_PRD_DB = False                   # Set 'True' to access PRD data (remember to turn the proxy on)
    REDIRECT_MARKET_API_TO_PRD = False      # Set 'True' to redirect market calls to PRD (assetList, stock_exchange_list)

    DB_DEFAULT['HOST'] = '127.0.0.1'
    STRIPE_API_KEY = 'sk_test_51HkbgHHiGSreEiGHJaeuPY9Vu4eVBNqCR8PCgSSs6PuHPB7UBlS9mz4mW72nrZ71ykyVdG6Ey5VUk6M7mfIHa0ON00hfr4vW3j'
    STRIPE_ENDPOINT_SECRET = 'whsec_jtWf54O3AMiVXQxK41fnPUdUFGXoxVCi'

    # Database
    if ACCESS_PRD_DB:
        # [PRD] (remember to turn the proxy on)
        DB_DEFAULT['PORT'] = '5433'
        DB_DEFAULT['NAME'] = 'frontend_prd'
        DB_DEFAULT['USER'] = 'frontend_prd'
    else:
        # [DEV]
        DB_DEFAULT['PORT'] = '5432'
        DB_DEFAULT['NAME'] = 'frontend_dev'
        DB_DEFAULT['USER'] = 'frontend_dev'

    # Market API Requests
    if REDIRECT_MARKET_API_TO_PRD:
        # [PRD]
        BACKEND_HOSTNAME = 'https://backend.phioon.com'
    else:
        # [DEV]
        BACKEND_HOSTNAME = 'http://127.0.0.1:8000'
# ----------

ALLOWED_HOSTS = ['*']

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ')4@_i569!ci89zt71+#bp^9fa%c#2ce+&9izdqkn+7-h60=y2d'

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
    'app',
    'market',
    'search_engine'
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
# [START db_setup]
DATABASES = {'default': DB_DEFAULT}
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

# DJANGO-REST-AUTH Configuration
OLD_PASSWORD_FIELD_ENABLED = True
LOGOUT_ON_PASSWORD_CHANGE = False
REST_AUTH_SERIALIZERS = {
    'PASSWORD_RESET_SERIALIZER': 'rest_auth.serializers.PasswordResetSerializer',
    'PASSWORD_RESET_CONFIRM_SERIALIZER ': 'rest_auth.serializers.PasswordResetConfirmSerializer',
    'PASSWORD_CHANGE_SERIALIZER': 'rest_auth.serializers.PasswordChangeSerializer'
}

from datetime import timedelta
REST_KNOX = {
    'TOKEN_LIMIT_PER_USER': 10,
    'USER_SERIALIZER': 'app.serializers_auth.UserSerializer',
    'TOKEN_TTL': timedelta(hours=8),
    'AUTO_REFRESH': True,
    'MIN_REFRESH_INTERVAL': 10800
}

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
