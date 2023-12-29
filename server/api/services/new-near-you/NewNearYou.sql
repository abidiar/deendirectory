const query = `
    SELECT * FROM services
    WHERE ST_DWithin(
        location,
        ST_MakePoint($1, $2)::GEOGRAPHY,
        40233.6
    ) AND date_added >= current_date - interval '30 days'
    ORDER BY date_added DESC;
`;

const values = [longitude, latitude]; 
