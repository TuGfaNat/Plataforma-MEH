import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Divider, Badge, Field, Input, Textarea, Select, Switch, Button, tokens, makeStyles, shorthands,
  Avatar, Tooltip, Tag, TagGroup, InteractionTag, InteractionTagPrimary
} from '@fluentui/react-components';
import { 
  CalendarLtr24Regular, Add24Regular, Map24Regular, Edit24Regular, Delete24Regular,
  Food24Regular, QrCode24Regular, PeopleTeam24Regular, Mic24Regular, Link24Regular,
  Clock24Regular, Dismiss24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../../components/ui';
import api, { resolveApiFileUrl } from '../../services/api';

const useStyles = makeStyles({
  grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginTop: '24px', alignItems: 'start' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' },
  selectableCard: { 
    padding: '16px', 
    ...shorthands.borderRadius('12px'), 
    backgroundColor: tokens.colorNeutralBackground1, 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    cursor: 'pointer', 
    transition: 'all 0.2s ease', 
    ':hover': { transform: 'translateX(4px)', ...shorthands.borderColor(tokens.colorBrandStroke1) } 
  },
  activeItem: { ...shorthands.borderColor(tokens.colorBrandStroke1), backgroundColor: tokens.colorBrandBackground2 },
  formPanel: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    padding: '24px', 
    backgroundColor: tokens.colorNeutralBackground2, 
    ...shorthands.borderRadius('20px'), 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3) 
  },
  infoCard: { 
    padding: '20px', 
    ...shorthands.borderRadius('20px'), 
    backgroundColor: tokens.colorNeutralBackground1, 
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3), 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  detailsContainer: { paddingLeft: '24px', borderLeft: `1px solid ${tokens.colorNeutralBackground3}` },
  agendaItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    marginBottom: '8px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3)
  },
  speakerSelection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  }
});

const EventsTab = ({ 
  eventosList, speakersList, selectedEventoId, setSelectedEventoId, isAddingEvento, setIsAddingEvento,
  isEditingEvento, setIsEditingEvento, newEvento, setNewEvento, handleSaveEvento, 
  handleEditEvento, confirmDelete, fetchData
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const [agenda, setAgenda] = useState([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditingEvento && selectedEventoId) {
      const ev = eventosList.find(e => e.id_evento === selectedEventoId);
      if (ev) {
        setAgenda(ev.agenda ? JSON.parse(ev.agenda) : []);
        setSelectedSpeakers(ev.speakers ? ev.speakers.map(s => s.id_speaker) : []);
      }
    } else if (!isAddingEvento) {
      setAgenda([]);
      setSelectedSpeakers([]);
    }
  }, [isEditingEvento, selectedEventoId, isAddingEvento, eventosList]);

  const validateForm = () => {
    const newErrors = {};
    if (!newEvento.titulo) newErrors.titulo = t("admin_event_title_required");
    if (!newEvento.fecha_inicio) newErrors.fecha_inicio = t("admin_event_date_required");
    if (!newEvento.hora_inicio) newErrors.hora_inicio = t("admin_event_time_required");
    if (!newEvento.ubicacion) newErrors.ubicacion = t("admin_event_location_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = () => {
    if (validateForm()) {
      handleSaveEvento({
        ...newEvento,
        agenda: JSON.stringify(agenda),
        id_speakers: selectedSpeakers
      });
    }
  };

  const addAgendaItem = () => {
    setAgenda([...agenda, { hora: '18:00', actividad: '', id_speaker: null }]);
  };

  const removeAgendaItem = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index, field, value) => {
    const updated = [...agenda];
    updated[index][field] = value;
    setAgenda(updated);
  };

  const toggleSpeaker = (id) => {
    if (selectedSpeakers.includes(id)) {
      setSelectedSpeakers(selectedSpeakers.filter(s => s !== id));
    } else {
      setSelectedSpeakers([...selectedSpeakers, id]);
    }
  };

  const currentEvent = eventosList.find(e => e.id_evento === selectedEventoId);

  return (
    <div className={styles.grid}>
      <div className={styles.sidebar}>
        <MEHTypography variant="h3">{t("admin_active_events")}</MEHTypography>
        <Divider />
        {eventosList.map(ev => (
          <div 
            key={`ev-${ev.id_evento}`} 
            className={`${styles.selectableCard} ${selectedEventoId === ev.id_evento ? styles.activeItem : ''}`} 
            onClick={() => setSelectedEventoId(ev.id_evento)}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', width: '100%'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <Badge color={ev.tipo_evento === 'HACKATHON' ? 'important' : 'brand'}>{ev.tipo_evento?.charAt(0)}</Badge>
                <div>
                  <b>{ev.titulo}</b><br/>
                  <MEHTypography variant="caption">{new Date(ev.fecha_inicio).toLocaleDateString()}</MEHTypography>
                </div>
              </div>
              <Badge color={ev.id_estado === 1 ? 'warning' : 'success'} appearance="tint">
                {ev.id_estado === 1 ? 'Inactivo' : 'Activo'}
              </Badge>
            </div>
          </div>
        ))}
        <MEHButton size="small" icon={<Add24Regular />} appearance="subtle" onClick={() => { setIsAddingEvento(true); setIsEditingEvento(false); setNewEvento({ titulo: '', descripcion: '', tipo_evento: 'CONFERENCIA', fecha_inicio: '', hora_inicio: '', modalidad: 'PRESENCIAL', ubicacion: '', link_mapas: '', capacidad_max: 50, refrigerio_incluido: false }); setAgenda([]); setSelectedSpeakers([]); }}>
          {t("admin_new_event")}
        </MEHButton>
      </div>
      
      <div className={styles.detailsContainer}>
        {isAddingEvento ? (
          <div className={styles.formPanel}>
            <MEHTypography variant="h2">{isEditingEvento ? t("edit") : t("admin_schedule")} {t("event")}</MEHTypography>
            
            <Field label={t("admin_event_title")} required validationState={errors.titulo ? "error" : "none"} validationMessage={errors.titulo}>
              <Input value={newEvento.titulo} onChange={(e, d) => setNewEvento({...newEvento, titulo: d.value})} />
            </Field>

            <Field label={t("admin_description")}>
              <Textarea rows={3} value={newEvento.descripcion} onChange={(e, d) => setNewEvento({...newEvento, descripcion: d.value})} placeholder={t("admin_event_description_placeholder")} />
            </Field>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <Field label={t("type")}>
                <Select value={newEvento.tipo_evento} onChange={(e) => setNewEvento({...newEvento, tipo_evento: e.target.value})}>
                  <option value="CONFERENCIA">{t("CONFERENCIA")}</option>
                  <option value="HACKATHON">{t("HACKATHON")}</option>
                  <option value="TALLER">{t("TALLER")}</option>
                  <option value="BOOTCAMP">{t("BOOTCAMP")}</option>
                  <option value="NETWORKING">{t("NETWORKING")}</option>
                </Select>
              </Field>
              <Field label={t("admin_modality")}>
                <Select value={newEvento.modalidad} onChange={(e) => setNewEvento({...newEvento, modalidad: e.target.value})}>
                  <option value="PRESENCIAL">{t("PRESENCIAL")}</option>
                  <option value="VIRTUAL">{t("VIRTUAL")}</option>
                  <option value="HIBRIDO">{t("HIBRIDO")}</option>
                </Select>
              </Field>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
              <Field label={t("admin_start_date")} required validationState={errors.fecha_inicio ? "error" : "none"} validationMessage={errors.fecha_inicio}>
                <Input type="date" value={newEvento.fecha_inicio} onChange={(e, d) => setNewEvento({...newEvento, fecha_inicio: d.value})} />
              </Field>
              <Field label={t("admin_start_time")} required validationState={errors.hora_inicio ? "error" : "none"} validationMessage={errors.hora_inicio}>
                <Input type="time" value={newEvento.hora_inicio} onChange={(e, d) => setNewEvento({...newEvento, hora_inicio: d.value})} />
              </Field>
              <Field label={t("admin_max_capacity")}>
                <Input type="number" value={newEvento.capacidad_max} onChange={(e, d) => setNewEvento({...newEvento, capacidad_max: d.value})} />
              </Field>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <Field label={t("admin_location")} required validationState={errors.ubicacion ? "error" : "none"} validationMessage={errors.ubicacion}>
                <Input contentBefore={<Map24Regular />} value={newEvento.ubicacion} onChange={(e, d) => setNewEvento({...newEvento, ubicacion: d.value})} placeholder={t("admin_location_placeholder")} />
              </Field>
              <Field label={t("admin_maps_link")}>
                <Input contentBefore={<Link24Regular />} value={newEvento.link_mapas} onChange={(e, d) => setNewEvento({...newEvento, link_mapas: d.value})} placeholder={t("admin_maps_link_placeholder")} />
              </Field>
            </div>

            <Divider>{t("admin_invited_speakers")}</Divider>
            <div className={styles.speakerSelection}>
              {speakersList.map(s => (
                <Tooltip content={s.nombre} relationship="label" key={s.id_speaker}>
                  <Avatar 
                    size={48} 
                    name={s.nombre} 
                    image={{src: resolveApiFileUrl(s.foto_url)}} 
                    style={{ 
                      cursor: 'pointer', 
                      border: selectedSpeakers.includes(s.id_speaker) ? `3px solid ${tokens.colorBrandStroke1}` : 'none',
                      opacity: selectedSpeakers.includes(s.id_speaker) ? 1 : 0.5
                    }}
                    onClick={() => toggleSpeaker(s.id_speaker)}
                  />
                </Tooltip>
              ))}
            </div>

            <Divider>{t("admin_event_agenda")}</Divider>
            <div>
              {agenda.map((item, idx) => (
                <div key={idx} className={styles.agendaItem}>
                  <Input type="time" value={item.hora} onChange={(e, d) => updateAgendaItem(idx, 'hora', d.value)} style={{ width: '100px' }} />
                  <Input value={item.actividad} onChange={(e, d) => updateAgendaItem(idx, 'actividad', d.value)} placeholder={t("admin_activity_placeholder")} style={{ flexGrow: 1 }} />
                  <Select value={item.id_speaker || ''} onChange={(e) => updateAgendaItem(idx, 'id_speaker', e.target.value)} style={{ width: '150px' }}>
                    <option value="">{t("admin_no_speaker")}</option>
                    {speakersList.filter(s => selectedSpeakers.includes(s.id_speaker)).map(s => (
                      <option key={s.id_speaker} value={s.id_speaker}>{s.nombre}</option>
                    ))}
                  </Select>
                  <Button icon={<Dismiss24Regular />} appearance="subtle" onClick={() => removeAgendaItem(idx)} />
                </div>
              ))}
              <MEHButton icon={<Add24Regular />} appearance="subtle" onClick={addAgendaItem}>{t("admin_add_agenda_block")}</MEHButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Switch label={t("admin_includes_catering")} checked={newEvento.refrigerio_incluido} onChange={(e, d) => setNewEvento({...newEvento, refrigerio_incluido: d.checked})} />
              <Switch 
                label="Evento Publicado (Activo en Plataforma)" 
                checked={newEvento.id_estado !== 1} 
                onChange={(e, d) => setNewEvento({...newEvento, id_estado: d.checked ? 2 : 1})} 
              />
            </div>
            
            <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
              <MEHButton onClick={onSave} appearance="primary" size="large">{t("admin_save_event")}</MEHButton>
              <Button onClick={() => setIsAddingEvento(false)} size="large">{t("cancel")}</Button>
            </div>
          </div>
        ) : selectedEventoId && currentEvent ? (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px'}}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <MEHTypography variant="h1" style={{ margin: 0 }}>{currentEvent.titulo}</MEHTypography>
                  <Badge color={currentEvent.id_estado === 1 ? 'warning' : 'success'} appearance="filled">
                    {currentEvent.id_estado === 1 ? 'INACTIVO' : 'ACTIVO'}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge color="brand" appearance="filled">{t(currentEvent.tipo_evento)}</Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                    <CalendarLtr24Regular fontSize="16px" />
                    <span>{new Date(currentEvent.fecha_inicio).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                    <Clock24Regular fontSize="16px" />
                    <span>{currentEvent.hora_inicio}</span>
                  </div>
                  <Divider vertical style={{ height: '16px' }} />
                  <Switch 
                    label={currentEvent.id_estado === 1 ? "Activar Evento" : "Desactivar Evento"} 
                    checked={currentEvent.id_estado !== 1} 
                    onChange={async (e, d) => {
                      try {
                        const newStatus = d.checked ? 2 : 1;
                        await api.put(`/eventos/${selectedEventoId}`, { id_estado: newStatus });
                        fetchData();
                      } catch (err) {
                        console.error("Error al cambiar estado del evento", err);
                      }
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MEHTypography variant="body" style={{ opacity: 0.8 }}>
                        <Map24Regular fontSize="18px" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {currentEvent.ubicacion}
                    </MEHTypography>
                    {currentEvent.link_mapas && (
                        <MEHButton size="small" icon={<Link24Regular />} onClick={() => window.open(currentEvent.link_mapas, '_blank')}>{t("admin_view_in_maps")}</MEHButton>
                    )}
                </div>
              </div>
              <div style={{display: 'flex', gap: '8px'}}>
                <MEHButton size="small" icon={<Edit24Regular />} onClick={() => handleEditEvento(currentEvent)}>{t("edit")}</MEHButton>
                <Button icon={<Delete24Regular />} size="small" appearance="subtle" style={{color: tokens.colorPaletteRedForeground1}} onClick={() => confirmDelete('evento', selectedEventoId, t("event").toLowerCase())} />
              </div>
            </div>
            
            <Divider style={{marginBottom: '24px'}} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className={styles.infoCard}>
                    <MEHTypography variant="h3"><Mic24Regular /> {t("speakers")}</MEHTypography>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {currentEvent.speakers?.length > 0 ? currentEvent.speakers.map(s => (
                            <Tooltip content={s.nombre} relationship="label" key={s.id_speaker}>
                                <Avatar size={48} name={s.nombre} image={{src: resolveApiFileUrl(s.foto_url)}} />
                            </Tooltip>
                        )) : <MEHTypography variant="caption">{t("admin_no_speakers_assigned")}</MEHTypography>}
                    </div>
                </div>
                <div className={styles.infoCard}>
                    <MEHTypography variant="h3"><PeopleTeam24Regular /> {t("management")}</MEHTypography>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <MEHButton icon={<QrCode24Regular />} appearance="primary">{t("admin_scan_qr")}</MEHButton>
                        <MEHButton appearance="outline">{t("admin_attendance_list")}</MEHButton>
                    </div>
                </div>
            </div>

            {currentEvent.agenda && (
                <div className={styles.infoCard} style={{ backgroundColor: tokens.colorNeutralBackground2 }}>
                    <MEHTypography variant="h3">{t("agenda")}</MEHTypography>
                    {JSON.parse(currentEvent.agenda).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '16px', padding: '8px 0', borderBottom: `1px solid ${tokens.colorNeutralBackground3}` }}>
                            <b style={{ minWidth: '60px', color: tokens.colorBrandForeground1 }}>{item.hora}</b>
                            <div style={{ flexGrow: 1 }}>
                                <MEHTypography variant="body"><b>{item.actividad}</b></MEHTypography>
                                {item.id_speaker && (
                                    <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                                        {t("admin_with_speaker")}: {speakersList.find(s => s.id_speaker == item.id_speaker)?.nombre}
                                    </MEHTypography>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '100px', opacity: 0.5}}>
            <CalendarLtr24Regular style={{fontSize: '64px'}} />
            <MEHTypography variant="h3">{t("admin_select_event_details")}</MEHTypography>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsTab;
