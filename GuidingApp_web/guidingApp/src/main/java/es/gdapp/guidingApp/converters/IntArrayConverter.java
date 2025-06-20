package es.gdapp.guidingApp.converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class IntArrayConverter implements AttributeConverter<int[][], String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(int[][] attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting int[][] to JSON", e);
        }
    }

    @Override
    public int[][] convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, int[][].class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting JSON to int[][]", e);
        }
    }
}
