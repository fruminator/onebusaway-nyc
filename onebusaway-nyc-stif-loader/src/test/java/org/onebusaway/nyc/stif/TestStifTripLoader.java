package org.onebusaway.nyc.stif;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import org.junit.Test;
import org.onebusaway.gtfs.impl.GtfsRelationalDaoImpl;
import org.onebusaway.gtfs.model.AgencyAndId;
import org.onebusaway.gtfs.model.Trip;
import org.onebusaway.gtfs.serialization.GtfsReader;


public class TestStifTripLoader {
	@Test
	public void testLoader() throws IOException {
	      ClassLoader classLoader = TestStifRecordReader.class.getClassLoader();
	      InputStream in = classLoader.getResourceAsStream("stif.m_0014__.210186.sun");
	      String gtfs = classLoader.getResource("m14.zip").getFile();

	      GtfsReader reader = new GtfsReader();
	      GtfsRelationalDaoImpl dao = new GtfsRelationalDaoImpl();
	      reader.setEntityStore(dao);
	      reader.setInputLocation(new File(gtfs));
	      reader.run();
	      
	      StifTripLoader loader = new StifTripLoader();
	      loader.setGtfsDao(dao);
	      loader.run(in);
	      Map<String, List<AgencyAndId>> mapping = loader.getTripMapping();
	      assertTrue(mapping.containsKey("1140"));
	      List<AgencyAndId> trips = mapping.get("1140");
	      AgencyAndId tripId = trips.get(0);
	      Trip trip = dao.getTripForId(tripId);
	      assertEquals(trip.getBlockId(), "11559238");
	      
	}
}
