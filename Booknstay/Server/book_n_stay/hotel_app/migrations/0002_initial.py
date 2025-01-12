# Generated by Django 5.0.1 on 2024-04-15 08:22

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('hotel_app', '0001_initial'),
        ('user_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='customer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user_app.customer'),
        ),
        migrations.AddField(
            model_name='booking',
            name='hotel',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.hotel'),
        ),
        migrations.AddField(
            model_name='payment',
            name='booking',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.booking'),
        ),
        migrations.AddField(
            model_name='payment',
            name='customer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user_app.customer'),
        ),
        migrations.AddField(
            model_name='reviewimage',
            name='review',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='hotel_app.review'),
        ),
        migrations.AddField(
            model_name='roomdetails',
            name='hotel_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.hotel'),
        ),
        migrations.AddField(
            model_name='roomadditionalactivites',
            name='room_details_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.roomdetails'),
        ),
        migrations.AddField(
            model_name='booking',
            name='room',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.roomdetails'),
        ),
        migrations.AddField(
            model_name='roomimages',
            name='room_details_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.roomdetails'),
        ),
        migrations.AddField(
            model_name='roomservices',
            name='hotel_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.hotel'),
        ),
        migrations.AddField(
            model_name='roomadditionalactivites',
            name='additional_activites',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.roomservices'),
        ),
        migrations.AddField(
            model_name='booking',
            name='selected_services',
            field=models.ManyToManyField(blank=True, to='hotel_app.roomservices'),
        ),
        migrations.AddField(
            model_name='roomdetails',
            name='room_type_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='hotel_app.roomtype'),
        ),
    ]
