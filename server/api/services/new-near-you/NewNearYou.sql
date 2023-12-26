SELECT * FROM services
WHERE ST_DWithin(
    location,
    ST_MakePoint(:longitude, :latitude)::GEOGRAPHY,
    40233.6
) AND date_added >= current_date - interval 'X days'
ORDER BY date_added DESC;
