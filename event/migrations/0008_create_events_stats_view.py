from django.db import migrations, models


VIEW_SQL = """
DROP VIEW IF EXISTS events_stats CASCADE;

CREATE VIEW events_stats AS
SELECT
    ROW_NUMBER() OVER (
        ORDER BY
            event_event_type.id,
            event_event.church_id,
            EXTRACT(YEAR FROM event_event.event_date),
            EXTRACT(MONTH FROM event_event.event_date)
    )::bigint AS id,
    event_event_type.event_type_name AS event_type_name,
    EXTRACT(MONTH FROM event_event.event_date)::int AS month,
    EXTRACT(YEAR FROM event_event.event_date)::int AS year,
    event_event.church_id AS church_id,
    SUM(event_event.total)::int AS totals,
    ROUND(AVG(event_event.total), 0)::int AS average
FROM event_event_type
JOIN event_event ON event_event_type.id = event_event.event_type_id
WHERE event_event_type.weekly_event = TRUE
GROUP BY
    event_event_type.id,
    event_event_type.event_type_name,
    EXTRACT(MONTH FROM event_event.event_date),
    EXTRACT(YEAR FROM event_event.event_date),
    event_event.church_id;
"""

DROP_VIEW_SQL = "DROP VIEW IF EXISTS events_stats CASCADE;"


class Migration(migrations.Migration):
    dependencies = [
        ("event", "0007_alter_event_type_event_day_of_week"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(sql=VIEW_SQL, reverse_sql=DROP_VIEW_SQL),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name="event_stats",
                    name="id",
                    field=models.BigIntegerField(primary_key=True, serialize=False),
                ),
                migrations.AlterField(
                    model_name="event_stats",
                    name="event_type_name",
                    field=models.CharField(max_length=50),
                ),
                migrations.AlterField(
                    model_name="event_stats",
                    name="month",
                    field=models.PositiveSmallIntegerField(verbose_name="month"),
                ),
                migrations.AlterField(
                    model_name="event_stats",
                    name="year",
                    field=models.PositiveIntegerField(verbose_name="year"),
                ),
                migrations.AlterField(
                    model_name="event_stats",
                    name="church_id",
                    field=models.IntegerField(verbose_name="church"),
                ),
                migrations.AlterField(
                    model_name="event_stats",
                    name="totals",
                    field=models.IntegerField(verbose_name="total"),
                ),
                migrations.AlterField(
                    model_name="event_stats",
                    name="average",
                    field=models.IntegerField(verbose_name="average"),
                ),
                migrations.AlterModelOptions(
                    name="event_stats",
                    options={
                        "verbose_name": "event_stat",
                        "verbose_name_plural": "event_stats",
                        "managed": False,
                        "default_permissions": (),
                        "ordering": ["year", "month", "church_id", "event_type_name"],
                    },
                ),
            ],
        ),
    ]
