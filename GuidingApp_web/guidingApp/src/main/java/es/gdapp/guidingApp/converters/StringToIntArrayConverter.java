package es.gdapp.guidingApp.converters;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToIntArrayConverter implements Converter<String, int[][]> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public int[][] convert(String source) {
        if (source == null || source.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(source, int[][].class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting area to int[][]: " + e.getMessage(), e);
        }
    }
}
