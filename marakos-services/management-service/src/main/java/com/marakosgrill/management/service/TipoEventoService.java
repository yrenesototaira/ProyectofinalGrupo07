package com.marakosgrill.management.service;

import com.marakosgrill.management.model.TipoEvento;
import com.marakosgrill.management.repository.TipoEventoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoEventoService {
    
    private final TipoEventoRepository tipoEventoRepository;
    
    public List<TipoEvento> getAllTiposEvento() {
        return tipoEventoRepository.findAll();
    }
    
    public TipoEvento getTipoEventoById(Integer id) {
        return tipoEventoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tipo de evento no encontrado con id: " + id));
    }
}
