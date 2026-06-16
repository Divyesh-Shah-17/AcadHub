package com.academic.projectmanager.service;

import com.opencsv.CSVReader;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvService {

    public List<String[]> parseCsv(InputStream inputStream) throws Exception {
        List<String[]> records = new ArrayList<>();
        try (CSVReader csvReader = new CSVReader(new InputStreamReader(inputStream))) {
            String[] values;
            while ((values = csvReader.readNext()) != null) {
                records.add(values);
            }
        }
        return records;
    }
}
