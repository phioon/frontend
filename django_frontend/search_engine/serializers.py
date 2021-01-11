from rest_framework import serializers
from app import models_auth, models as models_app


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = models_auth.UserCustom
        fields = ['username', 'first_name', 'last_name']


class StrategySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = models_app.Strategy
        fields = ['uuid', 'name', 'desc', 'type', 'owner_username']
